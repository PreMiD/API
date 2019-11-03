import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  if (
    !req.body.identifier ||
    typeof req.body.identifier !== "string" ||
    !req.body.presences ||
    !Array.isArray(req.body.presences)
  ) {
    res.sendStatus(404);
    return;
  }

  //* Delete older ones than 7 days
  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  science.deleteOne({ updated: { $lte: date.getTime() } });

  const user = await science.findOne({ identifier: req.body.identifier });

  if (!user)
    science.insertOne({
      identifier: req.body.identifier,
      presences: req.body.presences,
      updated: Date.now()
    });
  else
    science.findOneAndUpdate(
      { identifier: req.body.identifier },
      { $set: { presences: req.body.presences, updated: Date.now() } }
    );

  res.sendStatus(200);
};

//* Export handler
export { handler };
