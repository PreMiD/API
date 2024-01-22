import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";
import validator from "validator";

import { redis } from "..";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const params = req.params as { identifier: string };

	if (!params.identifier) return res.send(400);

	if (!validator.isUUID(params.identifier, "4"))
		return res.status(400).send("identifier must be a UUID v4.");

	await redis.hset(
		"pmd-api.scienceDeletes",
		params.identifier,
		params.identifier
	);

	return await res.redirect("https://premid.app");
};

export default handler;
