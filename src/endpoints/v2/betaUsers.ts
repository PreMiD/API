import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	res.send({ betaUsers: await betaUsers.countDocuments() });
};

//* Export handler
export { handler };
