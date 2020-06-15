import { cache } from "../../index";
import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

//* Define credits collection
let bug = cache.get("bugs");
cache.onUpdate("bugs", (data) => (bug = data));

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["token"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async (dUser) => {
			//* find user
			//* Return found bugs
			bug.filter((b) => b.userId === dUser.id && b.status === "New");
			if (bug) res.send(bug);
			else res.send({ error: 2, message: "No bugs found." });
		})
		.catch((err) => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
