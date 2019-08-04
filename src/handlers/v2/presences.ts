import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export = async (req: Request, res: Response) => {
  var presences;
  if (typeof req.params.presence === "undefined") {
    presences = (await MongoClient.db("PreMiD")
      .collection("presences")
      .find({}, { projection: { _id: false } })
      .toArray()).map(pr => {
      return pr;
    });

    res.send(presences);
  } else {
    presences = await MongoClient.db("PreMiD")
      .collection("presences")
      .findOne({ name: req.params.presence }, { projection: { _id: false } });
    if (!presences) res.sendStatus(404);
    else res.send(presences);
  }
};
