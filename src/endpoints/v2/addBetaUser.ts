import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");
const discordUsers = pmdDB.collection("discordUsers");

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
	const user = await betaUsers.findOne({ userId: req.params["userId"] });
	const discordUser = await discordUsers.findOne({ userId: req.params["userId"] });

	let betaUsersCount = await betaUsers.countDocuments();

	if (betaUsersCount < 200) {

		if (user) {
			res.send({ error: 2, message: "User already has beta access." });
			return;
		} else if (!user && discordUser) {
			await betaUsers.insertOne({ userId: req.params["userId"] }).then(() => res.sendStatus(200));
		} else if (!user && !discordUser) {
			res.send({ error: 3, message: "User not in Discord Server." });
			return;
		}

	} else {
		res.send({ error: 4, message: "No more beta access slots available." });
		return;
	}
};

//* Export handler
export { handler };
