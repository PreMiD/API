import { writeFileSync, readFileSync, existsSync } from "fs";
import { basename } from "path";
import { ensureDirSync } from "fs-extra";
import chokidar from "chokidar";

const cacheFolder = "../caches/";
export default class CacheManager {
	updateListeners = [];
	watcher: chokidar.FSWatcher;

	constructor() {
		ensureDirSync(cacheFolder);

		this.watcher = chokidar.watch("*", {
			cwd: cacheFolder,
			ignoreInitial: true
		});

		this.watcher.on("all", (event, path) => {
			if (!["add", "change"].includes(event) || path.endsWith(".expires"))
				return;
			this.updateListeners.map(l =>
				l.key === basename(path)
					? l.handler(this.get(basename(path)))
					: undefined
			);
		});
	}

	set(key: string, data: any, expires: number = 300000) {
		writeFileSync(cacheFolder + key, JSON.stringify(data));
		writeFileSync(cacheFolder + key + ".expires", Date.now() + expires);
	}

	get(key: string) {
		const cache = JSON.parse(readFileSync(cacheFolder + key, "utf-8"));

		if (typeof cache === "object") return JSON.parse(JSON.stringify(cache));
		else return cache;
	}

	hasExpired(key: string) {
		if (!existsSync(cacheFolder + key + ".expires")) return true;

		const expires = readFileSync(cacheFolder + key + ".expires", "utf-8");

		return parseInt(expires) <= Date.now();
	}

	onUpdate(key: string, handler: (data: any) => void) {
		this.updateListeners.push({ key, handler });
	}
}
