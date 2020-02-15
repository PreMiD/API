import "source-map-support/register";
import { config } from "dotenv";
config({ path: "../.env" });
import express from "express";
import debug from "./util/debug";
import { connect, pmdDB } from "./db/client";
import loadEndpoints from "./util/functions/loadEndpoints";
import { fork } from "child_process";
import bodyParser from "body-parser";
import helmet from "helmet";
import cluster from "cluster";
import { cpus } from "os";
import CacheManager from "./util/CacheManager";

export const cache = new CacheManager();

async function run() {
	if (cluster.isMaster) {
		connect()
			.then(async () => {
				await initCache();
				spawnWorkers();

				if (process.env.NODE_ENV === "production") {
					//* Update response Time (StatusPage)
					setTimeout(() => fork("./util/updateResponseTime"), 5 * 1000);
					setInterval(() => fork("./util/updateResponseTime"), 5 * 60 * 1000);
				}
			})
			.catch(err => debug("error", "index.ts", err.message));
		return;
	}

	//* Create express server
	//* Parse JSON
	//* Set API Headers
	let server = express();

	server.use(helmet());
	server.use(bodyParser.json());
	server.use((_req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		//* Don't hold connections open, we're an API duh
		res.setHeader("Connection", "close");

		next();
	});

	loadEndpoints(server, require("./endpoints.json"));
	server.listen(3001);
	debug("info", "index.ts", "Listening on port 3001");

	cluster.on("exit", worker => {
		debug("error", "index.ts", `Cluster worker ${worker.id} crashed.`);
		cluster.fork();
	});
}

function spawnWorkers() {
	const cpuCount = cpus().length;
	for (let i = 0; i < cpuCount; i++) {
		cluster.fork();
	}
}

let initialCacheI = null;
async function initCache() {
	if (cache.hasExpired("presences"))
		cache.set(
			"presences",
			await pmdDB
				.collection("presences")
				.find()
				.toArray()
		);

	if (cache.hasExpired("langFiles"))
		cache.set(
			"langFiles",
			await pmdDB
				.collection("langFiles")
				.find()
				.toArray()
		);

	if (cache.hasExpired("credits"))
		cache.set(
			"credits",
			await pmdDB
				.collection("credits")
				.find()
				.toArray(),
			1000 * 1000
		);

	if (cache.hasExpired("science"))
		cache.set(
			"science",
			await pmdDB
				.collection("science")
				.find()
				.toArray(),
			5 * 1000 * 1000
		);

	if (cache.hasExpired("versions"))
		cache.set(
			"versions",
			await pmdDB
				.collection("versions")
				.find()
				.toArray()
		);

	if (!initialCacheI) initialCacheI = setInterval(initCache, 1000);
}

run();
