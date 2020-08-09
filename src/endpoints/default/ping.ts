import { RouteShorthandMethod, RouteHandlerMethod } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface } from "fastify/types/route";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => res.send(200);

export { handler };
