import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

//* Define credits collection
const bug = pmdDB.collection("bugs");


//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["token"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {

			//* find user
			//* Return found bugs
			let result = await bug.find({userId: dUser.id, status: 'New'}, { projection: { _id: false }}).toArray();
			res.send(result);
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };