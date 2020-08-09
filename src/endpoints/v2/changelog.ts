import { cache } from "../../index";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

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
			.get("changelog")
			.filter(
				c =>
					c.project === req.params["project"] &&
					c.version === req.params["version"]
			)
	);
};

//* Export handler
export { handler };
