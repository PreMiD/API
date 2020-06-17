import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

let bugs = pmdDB.collection("bugs");
let bugInfo;

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.body.brief) {
		return res
			.status(449)
			.send({ error: 1, message: "No Bug brief providen." });
	}

	if (!req.body.description) {
		return res
			.status(449)
			.send({ error: 2, message: "No Bug description providen." });
	}
	if (!req.params["token"]) {
		return res.status(401).send({ error: 3, message: "No token providen." });
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			bugInfo = await bugs
				.find(
					{ userId: dUser.id, status: "New" },
					{ projection: { _id: false } }
				)
				.toArray();
			if (bugInfo.length < 3) {
				await bugs.insertOne({
					brief: req.body.brief,
					system: req.body.system,
					description: req.body.description,
					status: req.body.status,
					date: req.body.date,
					userName: dUser.username + "#" + dUser.discriminator,
					userId: dUser.id
				});
				res.sendStatus(200);
			} else res.send(429);
		})
		.catch(err => {
			res.sendStatus(500);
		});
};

//* Export handler
export { handler };
