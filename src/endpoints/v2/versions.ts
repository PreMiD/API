import { cache } from "../../index";
import { RequestHandler } from "express";

let versions = cache.get("versions");

cache.onUpdate("versions", data => (versions = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	delete versions[0].key;

	//* Return versions
	res.send(versions[0]);
};

//* Export handler
export { handler };
