import { MongoClient as mClient, Db } from "mongodb";
import { initialize as CrowdinInitialize } from "../util/crowdinManager";

export let pmdDB: Db = null;

export const client = new mClient(process.env.MONGO_URL, {
  appname: "PreMiD-API",
  useUnifiedTopology: true,
});

export const connect = async () => {
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then((mClient) => {
        resolve(mClient);
        pmdDB = client.db("PreMiD");

        CrowdinInitialize();
      })
      .catch(reject);
  });
};
