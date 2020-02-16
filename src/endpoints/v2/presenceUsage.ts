import { RequestHandler } from "express";
import { cache } from "../../index";

let science = cache.get("science");

cache.onUpdate("science", data => (science = data));

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
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
