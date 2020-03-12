import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname } from "path";
import { ensureDirSync } from "fs-extra";
import chokidar from "chokidar";
import { cache } from "../index";
import { pmdDB } from "../db/client";
import jsonStringify from "fast-json-stable-stringify";
import cluster from "cluster";

const cacheFolder = "../caches/";
export default class CacheManager {
	updateListeners = [];
	watcher: chokidar.FSWatcher;

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
		ensureDirSync(cacheFolder + key);
		writeFileSync(cacheFolder + key + "/data", jsonStringify(data));
		writeFileSync(cacheFolder + key + "/info", Date.now() + expires);
	}

	get(key: string) {
		return JSON.parse(readFileSync(cacheFolder + key + "/data", "utf-8"));
	}

	hasExpired(key: string) {
		if (!existsSync(cacheFolder + key + "/info")) return true;

		const expires = readFileSync(cacheFolder + key + "/info", "utf-8");

		return parseInt(expires) <= Date.now();
	}

	onUpdate(key: string, handler: (data: any) => void) {
		this.updateListeners.push({ key, handler });
	}
}

let initialCacheI = null;
export async function initCache() {
	if (!cluster.isMaster) return;

	if (cache.hasExpired("presences")) {
		cache.set(
			"presences",
			await pmdDB
				.collection("presences")
				.find({}, { projection: { _id: false } })
				.toArray()
		);
	}

	if (cache.hasExpired("langFiles"))
		cache.set(
			"langFiles",
			await pmdDB
				.collection("langFiles")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("credits")) {
		cache.set(
			"credits",
			await pmdDB
				.collection("credits")
				.find({}, { projection: { _id: false } })
				.toArray(),
			10 * 1000
		);
	}

	if (cache.hasExpired("science"))
		cache.set(
			"science",
			await pmdDB
				.collection("science")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("versions"))
		cache.set(
			"versions",
			await pmdDB
				.collection("versions")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("ffUpdates"))
		cache.set(
			"ffUpdates",
			await pmdDB
				.collection("ffUpdates")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("changelog"))
		cache.set(
			"changelog",
			await pmdDB
				.collection("changelog")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("discordUsers"))
		cache.set(
			"discordUsers",
			await pmdDB
				.collection("discordUsers")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("partners"))
		cache.set(
			"partners",
			await pmdDB
				.collection("partners")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("sponsors"))
		cache.set(
			"sponsors",
			await pmdDB
				.collection("sponsors")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (cache.hasExpired("jobs"))
		cache.set(
			"jobs",
			await pmdDB
				.collection("jobs")
				.find({}, { projection: { _id: false } })
				.toArray()
		);

	if (!initialCacheI) initialCacheI = setInterval(initCache, 10 * 1000);
}
