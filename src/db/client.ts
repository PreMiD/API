import { MongoClient as mClient, Db } from "mongodb";

export let pmdDB: Db = null;

export const client = new mClient(
  `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_IP}:27017`,
  {
    appname: "PreMiD-API",
    useUnifiedTopology: true
  }
);

export const connect = async () => {
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(mClient => {
        resolve(mClient);
        pmdDB = client.db("PreMiD");
      })
      .catch(reject);
  });
};
