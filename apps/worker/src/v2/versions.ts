import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { dSources } from "../util/dataSources";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const r = await dSources.versions.get();

	delete r!.key;
	delete r!._id;

	return res.send(r);
};

export default handler;
