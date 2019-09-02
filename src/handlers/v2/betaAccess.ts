import { MongoClient } from "../../db/client";
import { RequestHandler } from "express";

const handler: RequestHandler = async (req, res) => {
  if (typeof req.params.userId === "undefined") {
    res.send({ error: 1, message: "No user id providen." });
    return;
  }

  //* fetch versions from MongoDB
  const betaAccess = await MongoClient.db("PreMiD")
    .collection("betaAccess")
    .findOne({ userId: req.params.userId });

  res.send({ userId: req.params.userId, access: !!betaAccess });
};

export default handler;
