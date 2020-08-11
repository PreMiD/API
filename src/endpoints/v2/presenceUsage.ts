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
	let ranking = {};

	[].concat
		.apply(
			[],

			science.map(s => s.presences)
		)
		.map(function (x: string) {
			ranking[x] = (ranking[x] || 0) + 1;
		});

	return ranking;
}

//* Export handler
export { handler };
