import { RequestHandler } from "express";
import { cache } from "../../index";

let partners = cache.get("partners");

cache.onUpdate("partners", data => (partners = data));

//* Request Handler
const handler: RequestHandler = (_, res) => {
	res.send(partners);
};

//* Export handler
export { handler };
