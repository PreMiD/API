import { cache } from "../../index";
import { RequestHandler } from "express";

let jobs = cache.get("jobs");

cache.onUpdate("jobs", data => (jobs = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	res.send(jobs);
};

//* Export handler
export { handler };
