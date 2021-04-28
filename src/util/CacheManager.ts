import { CronJob } from "cron";
import { EventEmitter } from "events";
import LRU from "lru-cache";

import { pmdDB } from "../db/client";
import { prepareUsage } from "../endpoints/v2/presenceUsage";

export const presences: LRU<string, any> = new LRU(),
	langFiles: LRU<string, any> = new LRU(),
	credits: LRU<string, any> = new LRU(),
	versions: LRU<string, any> = new LRU(),
	ffUpdates: LRU<string, any> = new LRU(),
	changelog: LRU<string, any> = new LRU(),
	discordUsers: LRU<string, any> = new LRU(),
	partners: LRU<string, any> = new LRU(),
	sponsors: LRU<string, any> = new LRU(),
	jobs: LRU<string, any> = new LRU(),
	benefits: LRU<string, any> = new LRU(),
	downloads: LRU<string, any> = new LRU(),
	alphaUsers: LRU<string, any> = new LRU(),
	betaUsers: LRU<string, any> = new LRU(),
	CacheEventHandler = new EventEmitter();

const caches: {
	[name: string]: {
		cache: LRU<string, any>;
		key: string | Transformer;
		transformer?: Transformer;
	};
} = {
	presences: {
		cache: presences,
		key: "name"
	},
	langFiles: {
		cache: langFiles,
		key: data => data.map(d => `${d.lang}_${d.project}`)
	},
	credits: {
		cache: credits,
		key: "userId"
	},
	alphaUsers: {
		cache: alphaUsers,
		key: "userId"
	},
	discordUsers: {
		cache: discordUsers,
		key: "userId"
	},
	betaUsers: {
		cache: betaUsers,
		key: "userId"
	},
	downloads: {
		cache: downloads,
		key: "item"
	},
	versions: {
		cache: versions,
		key: "_id"
	},
	ffUpdates: {
		cache: ffUpdates,
		key: "version"
	},
	changelog: {
		cache: changelog,
		key: "string"
	},
	partners: {
		cache: partners,
		key: "name"
	},
	sponsors: {
		cache: sponsors,
		key: "name"
	},
	jobs: {
		cache: jobs,
		key: "jobName"
	},
	benefits: {
		cache: benefits,
		key: "_id"
	}
};

export let presenceUsage: { [key: string]: number } = {},
	users = 0;

export const cronJobs = {
	updatePresenceUsage: new CronJob("*/15 * * * *", updatePresenceUsage, null),
	updateUserCount: new CronJob("0 */1 * * *", updateUserCount, null)
};

export async function initCache() {
	for (const [k, v] of Object.entries(caches)) {
		await fillCache(k, v.cache, v.key, v.transformer);
	}

	await updatePresenceUsage(true);
	await updateUserCount(true);

	Object.values(cronJobs).map(j => j.start());

	const mongoStream = pmdDB.watch(
		[
			{
				$replaceRoot: {
					newRoot: {
						_id: "$_id",
						type: "$operationType",
						data: {
							$ifNull: ["$fullDocument", "$documentKey"]
						},
						db: "$ns.db",
						coll: "$ns.coll"
					}
				}
			}
		],
		{
			fullDocument: "updateLookup"
		}
	);
	//* updateCache
	mongoStream.on("change", (data: any) => {
		if (data.db !== "PreMiD" || !Object.keys(caches).includes(data.coll))
			return;

		if (data.type === "delete") deleteFromCache(data);
		else updateCache(data);
	});
}

async function updatePresenceUsage(initial = false) {
	const data = await prepareUsage();
	runEveryFirstMinuteOnce(() => (presenceUsage = data), initial);
}

async function updateUserCount(initial = false) {
	const data = await pmdDB.collection("science").countDocuments();
	runEveryFirstMinuteOnce(() => (users = data), initial);
}

function runEveryFirstMinuteOnce(callback: () => void, instantly = false) {
	if (instantly) return callback();

	const c = new CronJob("* * * * *", callback, () => c.stop());
}

type Transformer = (v: any[]) => any[];

async function fillCache(
	collection: string,
	cache: LRU<any, any>,
	key: string | Transformer,
	transformer?: Transformer
) {
	let data = await pmdDB.collection(collection).find().toArray();

	if (transformer) data = transformer(data);

	//@ts-ignore
	if (typeof key === "function") key = key(data);
	for (let i = 0; i < data.length; i++)
		cache.set(
			//@ts-ignore
			Array.isArray(key) ? key[i] : data[i][key],
			data[i]
		);
	CacheEventHandler.emit(collection);
}

async function updateCache(data: MongoData) {
	const cache = caches[data.coll];
	data.data = [data.data];
	if (cache.transformer) data.data = cache.transformer(data.data);
	//@ts-ignore
	if (typeof cache.key === "function") cache.key = cache.key(data.data);

	//@ts-ignore
	for (let i = 0; i < data.data.length; i++) {
		cache.cache.set(
			//@ts-ignore
			Array.isArray(cache.key) ? cache.key[i] : data.data[i][cache.key],
			data.data[i]
		);
	}
	CacheEventHandler.emit(data.coll);
}

async function deleteFromCache(data: MongoData) {
	const cache = caches[data.coll];
	cache.cache.forEach((v, k) => {
		if (v._id.toString() === data.data._id.toString()) cache.cache.del(k);
	});
	CacheEventHandler.emit(data.coll);
}

interface MongoData {
	_id: {
		_data: string;
	};
	type: string;
	data: any;
	coll: string;
	db: string;
}
