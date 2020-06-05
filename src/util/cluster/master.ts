import cluster from "cluster";
import debug from "../debug";
import { client, connect, pmdDB } from "../../db/client";
import { initCache } from "../CacheManager";
import { cpus } from "os";
import { fork } from "child_process";
import "source-map-support/register";

export let workers: Array<cluster.Worker> = [];

export async function master() {
	if (cluster.isMaster) {
		connect()
			.then(async () => {
				await initCache();
				spawnWorkers();
				let total = cpus().length;
				await new Promise(resolve => {
					let recv = 0;
					for (const worker of Object.values(cluster.workers)) {
						worker.once("message", () => {
							recv++;
							if (recv === total) resolve();
							debug(
								"info",
								"master.ts",
								`Worker ${recv} has received initial cache!`
							);
						});
					}
				});
				debug("info", "index.ts", "Listening on port 3001");

				if (process.env.NODE_ENV === "production") {
					//* Update response Time (StatusPage)
					setTimeout(() => fork("util/updateResponseTime"), 15 * 1000);
					setInterval(() => fork("util/updateResponseTime"), 5 * 60 * 1000);
				}
				setInterval(() => deleteOldUsers, 60 * 60 * 1000);
				deleteOldUsers();
			})
			.catch(err => {
				debug("error", "index.ts", err);
				process.exit();
			});
	}
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
