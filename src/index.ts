import "source-map-support/register";

import cluster from "cluster";

import { master } from "./util/cluster/master";
import { worker } from "./util/cluster/worker";

if (process.argv.includes("--no-cluster")) master().then(worker);
else if (cluster.isMaster) master();
else worker();
