import { cache } from "../../index";
import { RequestHandler } from "express";

let science = prepareUsage(cache.get("science"));

cache.on("update", (_, data) => (science = prepareUsage(data)), {
	only: "science"
});

//* Request Handler
const handler: RequestHandler = async (_req, res) => res.send(science);

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
