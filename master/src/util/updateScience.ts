import { mainLog, mongo, redis } from "..";

export default async function () {
	const log = mainLog.extend("updateScience"),
		key = "pmd-api.scienceUpdates";

	log("Updating...");
	const scienceUpdates = await redis.hVals(key);

	let invalidEntries: string[] = [],
		entries: {
			identifier: string;
			presences: string[];
			platform: { os: string; arch: string };
			updated: number;
		}[] = [];

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
			//* Invalid entry
		}
	}

	if (invalidEntries.length) {
		await redis.hDel(key, invalidEntries);
		log("Deleted %n invalid entries", invalidEntries.length);
	}

	if (entries.length) {
		const res = await mongo
			.db("PreMiD")
			//TODO Typings
			.collection<{}>("science")
			.bulkWrite(
				entries.map(e => ({
					updateOne: {
						filter: { identifier: e.identifier },
						update: { $set: e },
						upsert: true
					}
				}))
			);

		await redis.hDel(
			key,
			entries.map(e => e.identifier)
		);

		log(
			"Inserted %s entries, Updated %s entries",
			res.upsertedCount,
			res.modifiedCount
		);
	} else log("No entries to update");

	const delRedis = await redis.hVals("pmd-api.scienceDeletes");

	let orMatch: any[] = [
		{
			updated: { $lt: Date.now() - 31 * 24 * 60 * 60 * 1000 }
		}
	];

	if (delRedis.length) orMatch.push({ identifier: { $in: delRedis } });

	const delRes = await mongo.db("PreMiD").collection("science").deleteMany({
		$or: orMatch
	});

	if (delRedis.length) await redis.hDel("pmd-api.scienceDeletes", delRedis);

	if (delRes.deletedCount) log("Deleted %s entries", delRes.deletedCount);
}
