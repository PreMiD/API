import { cache } from "../../index";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

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
