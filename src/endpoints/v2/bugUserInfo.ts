import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

//* Define credits collection
const bug = pmdDB.collection("bugUsers");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	//* userId not providen
	if (!req.params["token"]) {
		//* send error
		//* return
		res.status(401).send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			//* find user
			//* Return user if found
			//* Else return default 3
			bug.findOne({ userId: dUser.id }, function (err, result) {
				res.send({ info: result });
			});
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
