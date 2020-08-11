import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { cache } from "../../index";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	//* user param not set
	if (!req.params["userId"]) {
		//* Send all users
		//* return
		res.send(cache.get("credits"));
		return;
	}

	//* find user
	//* Return user if found
	//* Else return error
	const user = cache
		.get("credits")
		.find(c => c.userId === req.params["userId"]);

	if (user) res.send(user);
	else res.status(404).send({ error: 2, message: "User not found." });
};

//* Export handler
export { handler };
