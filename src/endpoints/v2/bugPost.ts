import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

let bugs = pmdDB.collection("bugs");
let bugInfo;

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const body = req.body as any;

	if (!body.brief) {
		return res
			.status(449)
			.send({ error: 1, message: "No Bug brief providen." });
	}

	if (!body.description) {
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
					brief: body.brief,
					system: body.system,
					description: body.description,
					status: body.status,
					date: body.date,
					userName: dUser.username + "#" + dUser.discriminator,
					userId: dUser.id
				});
				res.send(200);
			} else res.send(429);
		})
		.catch(err => {
			res.send(500);
		});
};

//* Export handler
export { handler };
