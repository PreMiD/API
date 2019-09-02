import { MongoClient as mongoClient } from "mongodb";

export var MongoClient: mongoClient;

export async function connect(name = "PreMiD API"): Promise<mongoClient> {
  const client = await mongoClient.connect(
    `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${process.env.MONGOIP}:27017`,
    {
      useNewUrlParser: true,
      autoReconnect: true,
      useUnifiedTopology: true,
      appname: name
    }
  );

  MongoClient = client;
  return client;
}
