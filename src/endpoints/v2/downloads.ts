import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

const alphaUsers = pmdDB.collection("alphaUsers");
const betaUsers = pmdDB.collection("betaUsers");
const downloads = pmdDB.collection("downloads");

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	if (!req.params["token"] || !req.params["item"]) {
		//* send error
		//* return
		res.status(400).send({ error: 1, message: "No token/item providen." });
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
				if (alphaUser) return res.send(d);
				else if (betaUser && req.params["item"] == "beta") return res.send(d);
				else
					return res.status(401).send({
						error: 3,
						message: `User doesn't have ${req.params["item"]} access.`
					});
			}
		})
		.catch(err => {
			res.send(401);
		});
};

//* Export handler
export { handler };
