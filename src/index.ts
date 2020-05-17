import "source-map-support/register";
import { config } from "dotenv";
config({ path: "../.env" });

import CacheManager from "./util/CacheManager";
import { initialize as CrowdinInitialize } from "./util/crowdinManager";
import { master } from "./util/cluster/master";
import { worker } from "./util/cluster/worker";
import cluster from "cluster";

export const cache = new CacheManager();

CrowdinInitialize();
if (cluster.isMaster) master();
else worker();
