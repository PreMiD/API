import pLimit from "p-limit";
import { mainLog, mongo, redis } from "../index.js";

const limit = pLimit(Number.parseInt(process.env.LIMIT || "5"));
const BATCH_SIZE = Number.parseInt(process.env.BATCH_SIZE || "1000");

export default async function () {
	const log = mainLog.extend("updateHeartbeats");
	let count = 0;

	const processBatch = async (cursor: string) => {
		const result = await redis.hscan(
			"pmd-api.heartbeatUpdates",
			cursor,
			"COUNT",
			BATCH_SIZE
		);
		const newCursor = result[0];

		let batchToDelete = [];
		let data = [];
		for (let i = 0; i < result[1].length; i += 2) {
			const identifier = result[1][i];
			data.push(JSON.parse(result[1][i + 1]));

			batchToDelete.push(identifier);
			count++;
		}

		if (batchToDelete.length) {
			await redis.hdel("pmd-api.heartbeatUpdates", ...batchToDelete);

			const res = await mongo
				.db("PreMiD")
				.collection("heartbeats")
				.bulkWrite(
					data.map(d => ({
						updateOne: {
							filter: { identifier: d.identifier },
							update: {
								$set: { ...d, updated: new Date(d.updated) }
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
		}

		return newCursor;
	};

	let cursor = "0";
	do {
		cursor = await limit(() => processBatch(cursor));
	} while (cursor !== "0");

	if (count > 0) log("Updated %s entries", count);
}
