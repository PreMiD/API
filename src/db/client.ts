import { initialize as CrowdinInitialize } from "../util/crowdinManager";
import { config } from "dotenv";
import { Db, MongoClient as mClient } from "mongodb";
import { join } from "path";

config({ path: join(process.cwd(), "../.env") });

export let pmdDB: Db = null;

export const client = new mClient(process.env.MONGO_URL, {
	appname: "PreMiD-API",
	useUnifiedTopology: true
});

export const connect = async () => {
	return new Promise((resolve, reject) => {
		client
			.connect()
			.then(mClient => {
				resolve(mClient);
				pmdDB = client.db("PreMiD");

				CrowdinInitialize();
			})
			.catch(reject);
	});
};
