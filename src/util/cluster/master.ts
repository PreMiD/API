import "source-map-support/register";

import cluster from "cluster";
import { config } from "dotenv";
import { cpus } from "os";

import { client, connect, pmdDB } from "../../db/client";
import { initCache } from "../CacheManager";
import debug from "../debug";

config();

export let workers: Array<cluster.Worker> = [];

export async function master() {
	connect()
		.then(async () => {
			if (!process.argv.includes("--no-cluster")) spawnWorkers();
			await initCache();

			debug("info", "index.ts", "Listening on port 3001");

			deleteOldUsers();
			setInterval(() => deleteOldUsers, 60 * 60 * 1000);
		})
		.catch(err => {
			debug("error", "index.ts", err);
			process.exit();
		});
}

function spawnWorkers() {
	for (let i = 0; i < cpus().length; i++) {
		workers.push(cluster.fork());
	}
}

function deleteOldUsers() {
	//* Delete older ones than 7 days
	return pmdDB.collection("science").deleteMany({
		updated: {
			$lt: Date.now() - 7 * 24 * 60 * 60 * 1000
		}
	});
}

//? Still needed?
process.on("SIGINT", async function () {
	await Promise.all([
		client.close(),

		...workers.map(w => {
			return new Promise(resolve => {
				w.once("exit", resolve);
				if (!w.isDead) w.process.kill("SIGINT");
			});
		})
	]);
	process.exit(0);
});
