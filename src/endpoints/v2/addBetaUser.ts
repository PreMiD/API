import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");
const discordUsers = pmdDB.collection("discordUsers");

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
		res.status(401).send({ error: 1, message: "No token providen." });
		return;
	}

	const discordUser = await getDiscordUser(req.params["token"]);

	if (!discordUser) {
		res.status(403).send({ error: 2, message: "Invalid token providen." });
		return;
	}

	//* Find user in db
	//* Send response
	const user = await betaUsers.findOne({ userId: discordUser.id });

	let betaUsersCount = await betaUsers.countDocuments();

	if (betaUsersCount < 200) {
		if (user) {
			res.send({ error: 3, message: "User already has beta access." });
			return;
		} else if (
			!user &&
			(await discordUsers.findOne({
				userId: discordUser.id
			}))
		) {
			await betaUsers
				.insertOne({ userId: discordUser.id })
				.then(() => res.send(200));
		} else
			res
				.status(400)
				.send({ error: 4, message: "User not in Discord Server." });
	} else
		res
			.status(400)
			.send({ error: 5, message: "No more beta access slots available." });
};

//* Export handler
export { handler };
