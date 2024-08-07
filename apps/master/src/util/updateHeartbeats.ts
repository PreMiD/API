import pLimit from "p-limit";
import { mainLog, mongo, redis } from "../index.js";

const limit = pLimit(1);

const BATCH_SIZE = 10000;
export default async function () {
	limit(async () => {
		let count = 0;
		const log = mainLog.extend("updateHeartbeats");

		let cursor = "";
		do {
			const result = await redis.hscan(
				"pmd-api.heartbeatUpdates",
				cursor,
				"COUNT",
				BATCH_SIZE
			);
			cursor = result[0];

			let batchToDelete = [];
			let data = [];
			for (let i = 0; i < result[1].length; i += 2) {
				const identifier = result[1][i];
				data.push(JSON.parse(result[1][i + 1]));

				batchToDelete.push(identifier);
				count++;
			}

			if (!batchToDelete.length) continue;
			await redis.hdel("pmd-api.heartbeatUpdates", ...batchToDelete);

			const res = await mongo
				.db("PreMiD")
				.collection("heartbeats")
				.bulkWrite(
					data.map(d => ({
						updateOne: {
							filter: { identifier: d.identifier },
							update: {
								$set: { ...d, updated: new Date() }
							},
							upsert: true
						}
					}))
				);
			log(
				"Batch %s: Inserted %s entries, Updated %s entries",
				Math.floor(count / BATCH_SIZE) + 1,
				res.upsertedCount,
				res.modifiedCount
			);
		} while (cursor !== "0");

		if (count > 0) log("Updated %s entries", count);
	});
}
