import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

const tickets = pmdDB.collection("tickets");
const credits = pmdDB.collection("credits");

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	if (!req.params["token"]) {
		//* send error
		//* return
		res.status(401).send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			if (
				await credits.findOne({
					userId: dUser.id,
					roles: { $in: ["Staff Head"] }
				})
			) {
				res.send(
					await tickets.find({}, { projection: { _id: false } }).toArray()
				);
				return;
			}
		})
		.catch(err => {
			res.send(401);
		});
};

//* Export handler
export { handler };
