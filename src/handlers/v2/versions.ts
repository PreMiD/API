import { MongoClient } from "../../db/client";
import { RequestHandler } from "express";

const handler: RequestHandler = async (_req, res) => {
  //* fetch versions from MongoDB
  const versions = await MongoClient.db("PreMiD")
    .collection("versions")
    .findOne(
      { key: 0 },
      {
        projection: {
          _id: false,
          key: false,
        },
      },
    );

  //* Send response
  res.send(versions);
};

export { handler };
