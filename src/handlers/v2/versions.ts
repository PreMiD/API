import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

export = async (_req: Request, res: Response) => {
  //* fetch versions from MongoDB
  var versions = await MongoClient.db("PreMiD")
    .collection("versions")
    .findOne({ key: 0 });

  //* Delete unnecessary properties
  delete versions._id;
  delete versions.key;

  //* Send response
  res.send(versions);
};
