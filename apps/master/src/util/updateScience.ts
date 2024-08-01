import { mainLog, mongo, redis } from "../index.js";
import pLimit from "p-limit";

const limit = pLimit(1);
const BATCH_SIZE = 10000;

export default async function () {
	return limit(async () => {
		const log = mainLog.extend("updateScience"),
			key = "pmd-api.scienceUpdates";

		log("Updating...");
		const scienceUpdates = await redis.hvals(key);

		let invalidEntries = [],
			entries = [];

		for (const u of scienceUpdates) {
			try {
				const e = JSON.parse(u);

				entries.push({
					identifier: e.identifier,
					presences: e.presences,
					platform: {
						arch: e.platform.arch,
						os: e.platform.os
					},
					updated: Date.now()
				});
			} catch (e) {
				invalidEntries.push(u);
			}
		}

		if (invalidEntries.length) {
			await redis.hdel(key, ...invalidEntries);
			log("Deleted %n invalid entries", invalidEntries.length);
		}

		if (entries.length) {
			const bulkOps = entries.map(e => ({
				updateOne: {
					filter: { identifier: e.identifier },
					update: { $set: e },
					upsert: true
				}
			}));

			// Batch the bulk operations for better performance
			for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
				const batch = bulkOps.slice(i, i + BATCH_SIZE);
				const res = await mongo
					.db("PreMiD")
					.collection("science")
					.bulkWrite(batch);
				log(
					"Batch %s: Inserted %s entries, Updated %s entries",
					Math.floor(i / BATCH_SIZE) + 1,
					res.upsertedCount,
					res.modifiedCount
				);
			}

			// Batch Redis hdel operations
			for (let i = 0; i < entries.length; i += BATCH_SIZE) {
				const batch = entries.slice(i, i + BATCH_SIZE);
				await redis.hdel(key, ...batch.map(e => e.identifier));
			}
		} else {
			log("No entries to update");
		}

		const delRedis = await redis.hvals("pmd-api.scienceDeletes");

		let orMatch: any[] = [
			{
				updated: { $lt: Date.now() - 31 * 24 * 60 * 60 * 1000 }
			}
		];

		if (delRedis.length) {
			orMatch.push({ identifier: { $in: delRedis } });
		}

		const delCollection = mongo.db("PreMiD").collection("science");

		const delRes = await delCollection.deleteMany({
			$or: orMatch
		});

		if (delRedis.length) {
			// Batch Redis hdel operations
			for (let i = 0; i < delRedis.length; i += BATCH_SIZE) {
				const batch = delRedis.slice(i, i + BATCH_SIZE);
				await redis.hdel("pmd-api.scienceDeletes", ...batch);
			}
		}

		if (delRes.deletedCount) {
			log("Deleted %s entries", delRes.deletedCount);
		}
	});
}
