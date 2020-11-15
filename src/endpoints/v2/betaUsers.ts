import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";

//* Define credits collection
let betaUsers = pmdDB.collection("betaUsers").countDocuments();

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	res.send({ betaUsers: await betaUsers });
};

setInterval(
	() => (betaUsers = pmdDB.collection("betaUsers").countDocuments()),
	5 * 60 * 1000
);

//* Export handler
export { handler };
