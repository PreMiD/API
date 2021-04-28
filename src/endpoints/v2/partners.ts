import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { partners as cache } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_, res) => {
	res.send(
		cache.values().map(c => {
			delete c._id;
			return { ...c };
		})
	);
};

//* Export handler
export { handler };
