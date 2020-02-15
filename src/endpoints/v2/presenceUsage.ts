import { RequestHandler } from "express";
import { cache } from "../../index";

let science = cache.get("science"),
	lastCacheUpdate = Date.now() + 300000;

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
	if (lastCacheUpdate <= Date.now()) {
		lastCacheUpdate = Date.now() + 300000;
		science = cache.get("science");
	}

	let ranking = {};

	[].concat
		.apply(
			[],

			science.map(s => s.presences)
		)
		.map(function(x: string) {
			ranking[x] = (ranking[x] || 0) + 1;
		});

	res.send(ranking);
};

//* Export handler
export { handler };
