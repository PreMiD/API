import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

var coll = MongoClient.db("PreMiD").collection("credits");

export = async (req: Request, res: Response) => {
  var credits;

  if (typeof req.params.userID === "undefined") {
    //* fetch versions from MongoDB
    credits = await coll.find().toArray();
    //* Delete unnecessary properties
    credits = credits.map(migrate);
  } else {
    credits = await coll.findOne({ userId: req.params.userID });
    if (credits) credits = migrate(credits);
  }

  //* Send response
  res.send(credits);
};

function migrate(r: any) {
  r.userID = r.userId;
  r.patronColor = typeof r.patronColor === "undefined" ? "#fff" : r.patronColor;
  r.positon = r.rolePosition;

  delete r.userId;
  delete r._id;
  return r;
}
