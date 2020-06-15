import { cache } from "../../index";
import { RequestHandler } from "express";

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	delete cache.get("versions")[0].key;

	//* Return versions
	res.send(cache.get("versions")[0]);
};

//* Export handler
export { handler };
