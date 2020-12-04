import cluster from "cluster";

import { pmdDB } from "../db/client";
import { cache } from "../index";

let initialCacheI = null;
export async function initCache() {
	if (!cluster.isMaster) return;

	await Promise.all(
		cacheBuilder([
			"presences",
			"langFiles",
			{ name: "credits", expires: 5 * 1000 },
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
			{ name: "betaUsers", expires: 5 * 1000 },
		])
	);

	if (!initialCacheI) initialCacheI = setInterval(initCache, 10 * 1000);
}

function cacheBuilder(
	cachesToGet: Array<string | { name: string; expires: number }>
) {
	return cachesToGet.map((cTG) => {
		return new Promise<void>(async (resolve) => {
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
