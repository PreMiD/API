import { RequestHandler } from "express";
import { cache } from "../../index";

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
	let versions = cache.get("versions")[0];
	delete versions._id;
	delete versions._key;

	//* Return versions
	res.send(versions);
};

//* Export handler
export { handler };
