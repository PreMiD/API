import cluster from "cluster";
import { writeFileSync, readFileSync } from "fs";

export default class CacheManager {
	internalCache: Array<{ key: string; data: any; expires: number }> = [];

	private syncResolver;

	constructor() {
		if (cluster.isWorker) {
			process.on("message", msg => {
				if (!msg.CACHE_SET) return;
				this.internalCache = msg.CACHE_SET;
				if (this.syncResolver) this.syncResolver();
			});
		}

		if (cluster.isMaster) {
			Object.values(cluster.workers).map(w =>
				w.on("message", msg => {
					if (msg === "CACHE_SYNC")
						Object.values(cluster.workers).map(w =>
							w.send({ CACHE_SET: this.internalCache })
						);
				})
			);
		}
	}

	set(key: string, data: any, expires: number = Date.now() + 300000) {
		const cI = this.internalCache.findIndex(cI => cI.key === key),
			obj = { key: key, data: data, expires: expires };

		if (cI > -1) this.internalCache[cI] = obj;
		else this.internalCache.push(obj);

		writeFileSync("../cache", JSON.stringify(this.internalCache));
		this.internalCache = null;

		if (cluster.isMaster)
			Object.values(cluster.workers).map(w =>
				w.send({ CACHE_SET: this.internalCache })
			);
	}

	get(key: string) {
		this.internalCache = JSON.parse(readFileSync("../cache", "utf-8"));

		const cache = this.internalCache.find(cI => cI.key === key);
		if (typeof cache === "object")
			return JSON.parse(
				JSON.stringify(this.internalCache.find(cI => cI.key === key))
			);
		else return cache;
	}

	hasExpired(key: string) {
		this.internalCache = JSON.parse(readFileSync("../cache", "utf-8"));

		const cI = this.internalCache.find(cI => cI.key === key);

		if (!cI) return true;
		else return cI.expires <= Date.now();
	}

	async sync() {
		return new Promise(resolve => {
			this.syncResolver = resolve;
			process.send("CACHE_SYNC");
		});
	}
}
