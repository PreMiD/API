import CacheManager from "fast-node-cache";
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
		//@ts-ignore
		for (let i = 0; Object.keys(msg).length > i; i++) {
			//@ts-ignore
			cache.set(Object.keys(msg)[i], Object.values(msg)[i].data);
		}

		if (!recv) {
			recv = true;
			process.send("");
			worker();
		}
	});
}
