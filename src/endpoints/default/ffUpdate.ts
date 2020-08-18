import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { cache } from "../../index";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => {
	res.send({
		addons: {
			"support@premid.app": {
				updates: cache.get("ffUpdates")
			}
		}
	});
};

export { handler };
