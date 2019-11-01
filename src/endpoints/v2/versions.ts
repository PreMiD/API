import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const versions = pmdDB.collection("versions");

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
  //* Return versions
  res.send(
    await versions.findOne({}, { projection: { _id: false, key: false } })
  );
};

//* Export handler
export { handler };
