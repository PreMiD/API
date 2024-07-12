import { mainLog, mongo, redis } from "../index.js";
import pLimit from "p-limit";

const limit = pLimit(1);

export default function () {
	return limit(async () => {
		const log = mainLog.extend("calculatePresenceUsage");

		log("Calculating...");

		const res = Object.assign(
			{},
			...(await mongo
				.db("PreMiD")
				.collection("science")
				.aggregate([
					{ $unwind: "$presences" },
					{ $group: { _id: "$presences", count: { $sum: 1 } } }
				])
				.sort({ count: -1 })
				.map(d => ({ [d._id]: d.count }))
				.toArray())
		);

		log("Saving...");

		await redis.set("pmd-api.presence-usage", JSON.stringify(res));

		log("Updated!");
	});
}
