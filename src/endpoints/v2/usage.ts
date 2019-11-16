import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
  //* Return versions
  res.send({ users: await science.countDocuments() });
};

//* Export handler
export { handler };
