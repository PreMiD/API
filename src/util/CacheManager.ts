import chokidar from "chokidar";
import cluster from "cluster";
import jsonStringify from "fast-json-stable-stringify";
import { cache } from "../index";
import { pmdDB } from "../db/client";
import { dirname } from "path";
import { ensureDirSync } from "fs-extra";
import { existsSync, readFileSync, writeFileSync } from "fs";

const cacheFolder = "../caches/";
export default class CacheManager {
	updateListeners = [];
	watcher: chokidar.FSWatcher;
	private internalCache: any = {};

	constructor() {
		ensureDirSync(cacheFolder);

		this.watcher = chokidar.watch("**/*", {
			cwd: cacheFolder,
			ignoreInitial: true,
			awaitWriteFinish: true
		});

		this.watcher.on("all", (event, path) => {
			if (!["add", "change"].includes(event) || path.endsWith("info")) return;

			this.updateListeners.map(l =>
				l.key === dirname(path) ? l.handler(this.get(dirname(path))) : undefined
			);
		});
	}

	set(key: string, data: any, expires: number = 300000) {
		this.internalCache[key] = {
			data,
			expires: (Date.now() + expires).toString()
		};

		ensureDirSync(cacheFolder + key);
		writeFileSync(cacheFolder + key + "/data", jsonStringify(data));
		writeFileSync(
			cacheFolder + key + "/info",
			(Date.now() + expires).toString()
		);
	}

	get(key: string) {
		if (this.internalCache[key]) return this.internalCache[key].data;
		else {
			const data = JSON.parse(
				readFileSync(cacheFolder + key + "/data", "utf-8")
			);

			this.internalCache[key] = {
				data,
				expires: readFileSync(cacheFolder + key + "/info", "utf-8")
			};

			return data;
		}
	}

	hasExpired(key: string) {
		if (!this.internalCache[key]) {
			if (!existsSync(cacheFolder + key + "/info")) return true;

			const expires = readFileSync(cacheFolder + key + "/info", "utf-8");

			return parseInt(expires) <= Date.now();
		} else return this.internalCache[key].expires <= Date.now();
	}

	onUpdate(key: string, handler: (data: any) => void) {
		this.updateListeners.push({ key, handler });
	}
}

let initialCacheI = null;
export async function initCache() {
	if (!cluster.isMaster) return;

	await Promise.all(
		cacheBuilder([
			"presences",
			"langFiles",
			{ name: "credits", expires: 5 * 1000 },
			"science",
			"versions",
			"ffUpdates",
			"changelog",
			"discordUsers",
			"partners",
			"sponsors",
			"jobs",
			"benefits",
			"downloads",
			"alphaUsers",
			"betaUsers"
		])
	);
	if (!initialCacheI) initialCacheI = setInterval(initCache, 10 * 1000);
}

function cacheBuilder(
	cachesToGet: Array<string | { name: string; expires: number }>
) {
	return cachesToGet.map(cTG => {
		return new Promise(async resolve => {
			// @ts-ignore
			if (cache.hasExpired(cTG.name || cTG))
				cache.set(
					// @ts-ignore
					cTG.name || cTG,
					await pmdDB
						// @ts-ignore
						.collection(cTG.name || cTG)
						.find({}, { projection: { _id: false } })
						.toArray(),
					// @ts-ignore
					cTG.expires ? cTG.expires : undefined
				);
			resolve();
		});
	});
}
