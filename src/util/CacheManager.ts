import { writeFileSync, readFileSync } from "fs";
import { ensureDirSync } from "fs-extra";

const cacheFolder = "../caches/";

export default class CacheManager {
	cacheFiles: Array<{ name: string; expires: number }> = [];

	constructor() {
		ensureDirSync(cacheFolder);
	}

	set(key: string, data: any, expires: number = Date.now() + 300000) {
		if (!this.cacheFiles.find(cF => cF.name === key))
			this.cacheFiles.push({ name: key, expires: expires });
		else this.cacheFiles.find(cF => cF.name === key).expires = expires;

		writeFileSync(cacheFolder + key, JSON.stringify(data));
	}

	get(key: string) {
		const cache = JSON.parse(readFileSync(cacheFolder + key, "utf-8"));

		if (typeof cache === "object") return JSON.parse(JSON.stringify(cache));
		else return cache;
	}

	hasExpired(key: string) {
		const cacheFile = this.cacheFiles.find(cF => cF.name === key);

		if (!cacheFile) return true;
		return cacheFile.expires <= Date.now();
	}
}
