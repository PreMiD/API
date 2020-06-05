import { cache } from "../../index";
import { RequestHandler } from "express";

//* Request Handler
const handler: RequestHandler = async (_req, res) =>
	res.send({ users: cache.get("science").length });

//* Export handler
export { handler };
