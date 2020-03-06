import { RequestHandler } from "express";
import { cache } from "../../index";

let science = cache.get("science");

cache.onUpdate("science", data => (science = data));

//* Request Handler
const handler: RequestHandler = (_req, res) =>
	res.send({ users: science.length });

//* Export handler
export { handler };
