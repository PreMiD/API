import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

var coll = MongoClient.db("PreMiD").collection("changelog");

export = async (req: Request, res: Response) => {
  if (req.params.project && !req.params.version) {
    res.send(
      await coll
        .find({ project: req.params.project }, { projection: { _id: false } })
        .toArray()
    );
    return;
  }

  if (req.params.project && req.params.version) {
    res.send(
      await coll
        .find(
          { project: req.params.project, version: req.params.version },
          { projection: { _id: false } }
        )
        .toArray()
    );
    return;
  }
};
