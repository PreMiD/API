import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export const handler = async (req: Request, res: Response) => {
  var presences;
  if (typeof req.params.presence === "undefined") {
    presences = (await MongoClient.db("PreMiD")
      .collection("presences")
      .find({}, { projection: { _id: false, metadata: false } })
      .toArray()).map(pr => {
      return pr;
    });

    res.send(presences);
  } else {
    presences = await MongoClient.db("PreMiD")
      .collection("presences")
      .findOne(
        { name: req.params.presence },
        { projection: { _id: false, metadata: false } }
      );
    if (!presences) res.send({ error: 406, message: "Presence not found." });
    else res.send(presences);
  }
};
