import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

const usage = pmdDB.collection("usage");
const handler: RequestHandler = async (_req, res) =>
  res.send(
    await usage.findOne({ key: 0 }, { projection: { _id: false, key: false } })
  );

export { handler };
