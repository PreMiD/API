import { RequestHandler } from "express";
import { cache } from "../../index";

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
	const science = cache.get("science");

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
