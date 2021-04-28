import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { changelog as cache } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	//* project || version not set
	if (!req.params["project"] || !req.params["version"]) {
		//* send error
		//* return
		res.status(400).send({
			error: 1,
			message: `No ${!req.params["project"] ? "project" : "version"} providen.`
		});
		return;
	}

	//* Find changelog
	//* Send changelog
	res.send(
		cache
			.values()
			.filter(
				c =>
					c.project === req.params["project"] &&
					c.version === req.params["version"]
			)
			.map(c => {
				delete c._id;
				return { ...c };
			})
	);
};

//* Export handler
export { handler };
