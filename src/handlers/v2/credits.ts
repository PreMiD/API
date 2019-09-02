import { MongoClient } from "../../db/client";
import { RequestHandler } from "express";

const handler: RequestHandler = async (req, res) => {
  const database = MongoClient.db("PreMiD");
  const creditsCollection = database.collection("credits");
  let response = undefined;

  if (typeof req.params.userId === "undefined") {
    response = creditsCollection.find({}, { projection: { _id: 0 } }).toArray();
  } else {
    response = creditsCollection.findOne(
      { userId: req.params.userId },
      { projection: { _id: 0 } },
    );

    if (!response) {
      res.send({ error: 2, message: "No such user." });
      return;
    }
  }

  //* Send response
  res.send(response);
};

export { handler };
