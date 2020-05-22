import cluster from "cluster";
import debug from "../debug";
import { worker } from "./worker";
import { client, connect, pmdDB } from "../../db/client";
import { initCache } from "../CacheManager";
import { cpus } from "os";
import { fork } from "child_process";
import "source-map-support/register";

export async function master() {
	if (cluster.isMaster) {
		connect()
			.then(async () => {
				await initCache();
				spawnWorkers();

				if (process.env.NODE_ENV === "production") {
					//* Update response Time (StatusPage)
					setTimeout(() => fork("util/updateResponseTime"), 15 * 1000);
					setInterval(() => fork("util/updateResponseTime"), 5 * 60 * 1000);
				}
				setInterval(() => deleteOldCredits, 60 * 60 * 1000);
				deleteOldCredits();
			})
			.catch(err => {
				debug("error", "index.ts", err);
				process.exit();
			});

		debug("info", "index.ts", "Listening on port 3001");
		return;
	}
}

let workers: Array<cluster.Worker> = [];
function spawnWorkers() {
	const cpuCount =
		process.env.NODE_ENV === "dev" ? cpus().length : cpus().length / 2;
	for (let i = 0; i < cpuCount; i++) {
		workers.push(cluster.fork());
	}
}

function deleteOldCredits() {
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
