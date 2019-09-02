import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

export const handler = async (req: Request, res: Response) => {
  if (typeof req.params.userId === "undefined") {
    res.send(JSON.stringify({ error: 410, message: "No user id provided." }));
    return;
  }

  //* fetch versions from MongoDB
  var betaAccess = await MongoClient.db("PreMiD")
    .collection("betaAccess")
    .findOne({ userId: req.params.userId });

  if (betaAccess)
    //* Send response
    res.send({ access: true });
  else res.send({ access: false });
};
