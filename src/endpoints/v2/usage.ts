import { cache } from "../../index";
import { RequestHandler } from "express";

let science = cache.get("science");

cache.onUpdate("science", data => (science = data));

//* Request Handler
const handler: RequestHandler = async (_req, res) =>
	res.send({ users: science.length });

//* Export handler
export { handler };
