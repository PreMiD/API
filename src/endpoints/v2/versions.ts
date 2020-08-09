import { cache } from "../../index";

import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_, res) => {
	delete cache.get("versions")[0].key;

	//* Return versions
	res.send(cache.get("versions")[0]);
};

//* Export handler
export { handler };
