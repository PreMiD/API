import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export const handler = async (_req: Request, res: Response) => {
  var usage = await MongoClient.db("PreMiD")
    .collection("usage")
    .findOne({ key: 0 });

  delete usage._id;
  delete usage.key;
  //* Send response
  res.send(usage);
};
