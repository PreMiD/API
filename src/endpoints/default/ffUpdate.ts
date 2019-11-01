import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

const ffUpdates = pmdDB.collection("ffUpdates");
const handler: RequestHandler = async (_req, res) =>
  res.send({
    addons: {
      "support@premid.app": {
        updates: await ffUpdates
          .find({}, { projection: { _id: false } })
          .toArray()
      }
    }
  });

export { handler };
