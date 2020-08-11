import "source-map-support/register";

import cluster from "cluster";
import CacheManager from "fast-node-cache";

import { master } from "./util/cluster/master";
import { worker } from "./util/cluster/worker";

export const cache = new CacheManager({
	cacheDirectory: "../caches",
	memoryOnly: false,
	discardTamperedCache: true
});

if (cluster.isMaster) master();
else worker();
