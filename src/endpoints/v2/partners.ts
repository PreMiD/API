import { cache } from "../../index";
import { RequestHandler } from "express";

let partners = cache.get("partners");

cache.onUpdate("partners", data => (partners = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	res.send(partners);
};

//* Export handler
export { handler };
