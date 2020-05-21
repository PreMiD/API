import { cache } from "../../index";
import { RequestHandler } from "express";

let sponsors = cache.get("sponsors");

cache.onUpdate("sponsors", data => (sponsors = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	res.send(sponsors);
};

//* Export handler
export { handler };
