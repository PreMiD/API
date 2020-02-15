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

	//* Return versions
	res.send({ users: science.length });
};

//* Export handler
export { handler };
