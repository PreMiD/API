import cluster from "cluster";
import { cache } from "../index";
import { pmdDB } from "../db/client";

let initialCacheI = null;
export async function initCache() {
	if (!cluster.isMaster) return;

	await Promise.all(
		cacheBuilder([
			"presences",
			"presenceData",
			"langFiles",
			{ name: "credits", expires: 5 * 1000 },
			{ name: "bugUsers", expires: 2 * 1000 },
			{ name: "bugs", expires: 2 * 1000 },
			"science",
			"versions",
			"ffUpdates",
			"changelog",
			"discordUsers",
			"partners",
			"sponsors",
			"jobs",
			"benefits",
			"downloads",
			"alphaUsers",
			"betaUsers"
		])
	);

	//* deno > Welcome to node and its flaws
	for (const worker of Object.values(cluster.workers)) {
		// @ts-ignore
		if (worker.isConnected()) worker.send(cache.internalCache);
	}
	if (!initialCacheI) initialCacheI = setInterval(initCache, 10 * 1000);
}

function cacheBuilder(
	cachesToGet: Array<string | { name: string; expires: number }>
) {
	return cachesToGet.map(cTG => {
		return new Promise(async resolve => {
			// @ts-ignore
			if (cache.isExpired(cTG.name || cTG))
				cache.set(
					// @ts-ignore
					cTG.name || cTG,
					await pmdDB
						// @ts-ignore
						.collection(cTG.name || cTG)
						.find({}, { projection: { _id: false } })
						.toArray(),
					// @ts-ignore
					cTG.expires ? cTG.expires : undefined
				);
			resolve();
		});
	});
}
