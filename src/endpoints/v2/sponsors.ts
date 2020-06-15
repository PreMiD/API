import { cache } from "../../index";
import { RequestHandler } from "express";

//* Request Handler
const handler: RequestHandler = async (_, res) =>
	res.send(cache.get("sponsors"));

//* Export handler
export { handler };
