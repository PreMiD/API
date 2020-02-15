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

	versions = versions[0];
	delete versions._id;
	delete versions._key;

	//* Return versions
	res.send(versions);
};

//* Export handler
export { handler };
