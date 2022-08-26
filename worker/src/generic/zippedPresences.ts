import { RouteHandlerMethod } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { createReadStream } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	res.type("application/zip").send(createReadStream("tmp/presences.zip"));
};

export default handler;
