import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { versions } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_, res) => {
	const v = versions.values()[0];
	delete v.key;
	delete v._id;

	//* Return versions
	res.send(v);
};

//* Export handler
export { handler };
