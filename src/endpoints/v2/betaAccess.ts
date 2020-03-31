import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");
const alphaUsers = pmdDB.collection("alphaUsers");

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
	try {
		const user =
			(await betaUsers.findOne(
				{ userId: req.params["userId"] },
				{ projection: { _id: false, keysLeft: false } }
			)) ||
			(await alphaUsers.findOne(
				{ userId: req.params["userId"] },
				{ projection: { _id: false, keysLeft: false } }
			));

		res.send({ access: user ? true : false });
	} catch (err) {
		res.sendStatus(500);
	}
};

//* Export handler
export { handler };
