import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

//* Define bugUserInfo collection
let bugs = Array();

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	//* userId not providen
	if (!req.params["token"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			//* find user
			//* Return user if found
			// @ts-ignore
			bugs = await pmdDB
				.collection("bugs")
				.find(
					{ userId: dUser.id, status: "New" },
					{ projection: { _id: false } }
				)
				.toArray();
			if (bugs.length === 0) {
				return res.send({ count: 3 });
			} else if (bugs.length >= 1 && bugs.length <= 3) {
				return res.send({ count: 3 - bugs.length, bugs: bugs });
			} else {
				return res.send(500);
			}
		})
		.catch(err => {
			return res.send(500);
		});
};

//* Export handler
export { handler };
