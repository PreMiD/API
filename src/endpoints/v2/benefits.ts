import { RequestHandler } from "express";
import { cache } from "../../index";

let benefits = cache.get("benefits");

cache.onUpdate("benefits", data => (benefits = data));

//* Request Handler
const handler: RequestHandler = (_, res) => {
	res.send(benefits);
};

//* Export handler
export { handler };
