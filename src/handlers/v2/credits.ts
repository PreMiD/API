import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

export = async (_req: Request, res: Response) => {
  //* fetch versions from MongoDB
  var credits = await MongoClient.db("PreMiD")
    .collection("credits")
    .find()
    .toArray();

  //* Delete unnecessary properties
  credits = credits.map(r => {
    delete r._id;
    return r;
  });

  //* Send response
  res.send(credits);
};
