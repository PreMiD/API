import { RequestHandler } from "express";
import { cache } from "../../index";

let jobs = cache.get("jobs");

cache.onUpdate("jobs", data => (jobs = data));

//* Request Handler
const handler: RequestHandler = (_, res) => {
	res.send(jobs);
};

//* Export handler
export { handler };
