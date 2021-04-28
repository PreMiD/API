import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { ffUpdates as cache } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => {
	const updates = cache.values();
	updates.forEach(c => delete c._id);

	res.send({
		addons: {
			"support@premid.app": {
				updates
			}
		}
	});
};

export { handler };
