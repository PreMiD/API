import "source-map-support/register";
import debug from "../debug";
import { connect, pmdDB } from "../../db/client";
import { fork } from "child_process";
import cluster from "cluster";
import { initCache } from "../CacheManager";
import { cpus } from "os";

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

				//* Delete older ones than 7 days
				const date = new Date();
				date.setTime(date.getTime() - 7 * 24 * 60 * 60 * 1000);
				pmdDB.collection("science").deleteOne({
					updated: { $lt: date.getTime() }
				});
			})
			.catch(err => debug("error", "index.ts", err.message));

		debug("info", "index.ts", "Listening on port 3001");
		return;
	}
}

function spawnWorkers() {
	const cpuCount = cpus().length;
	for (let i = 0; i < cpuCount; i++) {
		cluster.fork();
	}
}
