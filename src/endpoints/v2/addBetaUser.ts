import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	//* userId not providen
	if (!req.params["userId"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No userId providen." });
		return;
	}

	//* Find user in db
	//* Send response
	const user = await betaUsers.findOne(
		{ userId: req.params["userId"] }
	);

	if (user) {
		res.send({ error: 2, message: "User already has beta access." });
		return;
	} else await betaUsers.insertOne({ userId: req.params["userId"] }).then(() => res.sendStatus(200));

};

//* Export handler
export { handler };
