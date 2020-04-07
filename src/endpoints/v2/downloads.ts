import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

const credits = pmdDB.collection("credits");
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
		.then(async (dUser) => {
			let cUser = await credits.findOne({
				userId: dUser.id,
			});

			let d = await downloads.findOne({ item: req.params["item"] });

			if (d && cUser.roles.includes(req.params["item"].toUpperCase())) {
				res.send({ link: d.link });
				return;
			} else {
				res.send({
					error: 2,
					message: `Item not found / User doesn't have ${req.params["item"]} access.`,
				});
				return;
			}
		})
		.catch((err) => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
