import { RequestHandler } from "express";
import { cache } from "../../index";

let versions = cache.get("versions"),
	lastCacheUpdate = Date.now() + 300000;

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
	if (lastCacheUpdate <= Date.now()) {
		lastCacheUpdate = Date.now() + 300000;
		versions = cache.get("versions");
	}

	delete versions[0]._id;
	delete versions[0]._key;

	//* Return versions
	res.send(versions[0]);
};

//* Export handler
export { handler };
