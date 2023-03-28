import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";
import MongoDBCaching from "mongodb-caching";

import { dSources } from "../util/dataSources";

export class FFUpdates extends MongoDBCaching {
	getAll() {
		return this.find();
	}
}

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const updates = await dSources.ffUpdates.getAll();

	//@ts-ignore
	for (const u of updates) delete u._id;

	return res.send({
		addons: {
			"support@premid.app": {
				updates
			}
		}
	});
};

export default handler;
