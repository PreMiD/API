import CacheManager from "cache";
import cluster from "cluster";
import { master } from "./util/cluster/master";
import { worker } from "./util/cluster/worker";
import "source-map-support/register";

export const cache = new CacheManager({
	cacheDirectory: "../caches",
	memoryOnly: false,
	discardTamperedCache: true
});

if (cluster.isMaster) master();
else {
	let recv = false;
	cluster.worker.on("message", msg => {
		// @ts-ignore
		if (recv) cache.internalCache = msg;
		if (!recv) {
			// @ts-ignore
			cache.internalCache = msg;
			recv = true;
			process.send("");
			worker();
		}
	});
}
