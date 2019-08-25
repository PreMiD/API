import { MongoClient as mongoClient } from "mongodb";

export var MongoClient: mongoClient;

export function connect(name = "PreMiD API") {
  return new Promise<mongoClient>((resolve, reject) => {
    mongoClient
      .connect(
        `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${
          process.env.MONGOIP
        }:${27017}`,
        {
          useNewUrlParser: true,
          autoReconnect: true,

          appname: name
        }
      )
      .then(mongoClient => {
        MongoClient = mongoClient;
        resolve(mongoClient);
      })
      .catch(reject);
  });
}
