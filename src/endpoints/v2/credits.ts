import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { credits as cache } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	//* user param not set
	if (!req.params["userId"]) {
		const c = cache.values();
		c.forEach(c => delete c._id);
		//* Send all users
		//* return
		return res.send(cache.values());
	}

	//* find user
	//* Return user if found
	//* Else return error

	if (cache.has(req.params["userId"])) {
		const c = cache.get(req.params["userId"]);
		delete c._id;

		res.send(c);
	} else res.status(404).send({ error: 2, message: "User not found." });
};

//* Export handler
export { handler };
