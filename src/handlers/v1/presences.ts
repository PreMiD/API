import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export = async (req: Request, res: Response) => {
  var presences;
  if (typeof req.params.presence === "undefined") {
    presences = (await MongoClient.db("PreMiD")
      .collection("presences")
      .find()
      .toArray()).map(pr => {
      delete pr._id;
      return pr;
    });
    res.send(presences);
  } else {
    presences = await MongoClient.db("PreMiD")
      .collection("presences")
      .findOne({ name: req.params.presence });
    if (!presences) res.send({ error: 406, message: "Presence not found." });
    else {
      delete presences._id;
      res.send(presences);
    }
  }
};
