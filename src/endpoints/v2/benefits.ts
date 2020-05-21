import { cache } from "../../index";
import { RequestHandler } from "express";

let benefits = cache.get("benefits");

cache.onUpdate("benefits", data => (benefits = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	res.send(benefits);
};

//* Export handler
export { handler };
