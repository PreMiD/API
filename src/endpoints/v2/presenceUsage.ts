import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { cache } from "../../";
import { pmdDB } from "../../db/client";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => res.send(cache.get("presenceUsage"));

export async function prepareUsage() {
	const data = await pmdDB
			.collection("science")
			.aggregate([
				{ $unwind: "$presences" },
				{ $group: { _id: "$presences", count: { $sum: 1 } } }
			])
			.sort({ count: -1 })
			.map(d => {
				return { [d._id]: d.count };
			})
			.toArray(),
		ranking = Object.assign(
			{},
			...data.filter(p =>
				cache
					.get("presences")
					.find(p1 => p1.metadata.service === Object.keys(p)[0])
			)
		);

	return ranking;
}

//* Export handler
export { handler };
