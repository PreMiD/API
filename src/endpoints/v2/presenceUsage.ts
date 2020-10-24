import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { cache } from "../../index";

let science = prepareUsage(cache.get("science"));

cache.on("update", (_, data) => (science = prepareUsage(data)), {
	only: "science"
});

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => res.send(science);

export function prepareUsage(science) {
	let ranking = {},
		ranks = [];

	for (let i = 0; i < science.length; i++) {
		ranks.push(science.presences[i]);
	}

	for (let i = 0; i < ranks.length; i++) {
		ranking[ranks[i]] = (ranking[ranks[i]] || 0) + 1;
	}

	return ranking;
}

//* Export handler
export { handler };
