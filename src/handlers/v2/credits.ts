import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

var credits;

export = async (req: Request, res: Response) => {
  if (typeof req.params.userId === "undefined") {
    //* fetch versions from MongoDB
    credits = await MongoClient.db("PreMiD")
      .collection("credits")
      .find({}, { projection: { _id: 0 } })
      .toArray();
  } else {
    credits = await MongoClient.db("PreMiD")
      .collection("credits")
      .findOne({ userId: req.params.userId }, { projection: { _id: 0 } });
  }

  //* Send response
  res.send(credits);
};
