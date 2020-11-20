import { RouteHandlerMethod } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => res.send();

export { handler };
