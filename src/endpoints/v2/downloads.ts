import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

const alphaUsers = pmdDB.collection("alphaUsers");
const betaUsers = pmdDB.collection("betaUsers");
const downloads = pmdDB.collection("downloads");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["token"] || !req.params["item"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No token/item providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			let alphaUser = await alphaUsers.findOne({ userId: dUser.id });
			let betaUser = await betaUsers.findOne({ userId: dUser.id });

			let d = await downloads.findOne(
				{ item: req.params["item"] },
				{ projection: { _id: false } }
			);

			if (d) {
				if (alphaUser) return res.json(d);
				else if (betaUser && req.params["item"] == "beta") return res.json(d);
				else
					return res.send({
						error: 3,
						message: `An error occured.`
					});
			}
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
