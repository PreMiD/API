import { Db, MongoClient as mClient } from "mongodb";

import { initialize as CrowdinInitialize } from "../util/crowdinManager";

export let pmdDB: Db = null;
export let rcdDB: Db = null;

export const client = new mClient(process.env.MONGO_URL, {
	appName: "PreMiD-API"
});

export const connect = async () => {
	return new Promise((resolve, reject) => {
		client
			.connect()
			.then(mClient => {
				resolve(mClient);
				pmdDB = client.db("PreMiD");
				rcdDB = process.env.NODE_ENV !== "dev" ? client.db("Recodive") : null;

				CrowdinInitialize();
			})
			.catch(reject);
	});
};
