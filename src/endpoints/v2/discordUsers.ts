import { cache } from "../../index";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_, res) => res.send(cache.get("discordUsers"));

//* Export handler
export { handler };
