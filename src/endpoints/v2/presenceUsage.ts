import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";
import { presences, presenceUsage as cache } from "../../util/CacheManager";

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_req, res) => res.send(cache);

export async function prepareUsage() {
	const data = await pmdDB
			.collection("science")
			.aggregate(
				[
					{ $unwind: "$presences" },
					{ $group: { _id: "$presences", count: { $sum: 1 } } }
				],
				{ allowDiskUse: true }
			)
			.sort({ count: -1 })
			.map(d => {
				return { [d._id]: d.count };
			})
			.toArray(),
		ranking = Object.assign(
			{},
			...data.filter(p =>
				presences.values().find(p1 => p1.metadata.service === Object.keys(p)[0])
			)
		);

	return ranking;
}

//* Export handler
export { handler };
