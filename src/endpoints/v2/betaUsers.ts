import { pmdDB } from "../../db/client";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	res.send({ betaUsers: await betaUsers.countDocuments() });
};

//* Export handler
export { handler };
