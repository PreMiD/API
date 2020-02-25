import { RequestHandler } from "express";
import { cache } from "../../index";

let sponsors = cache.get("sponsors");

cache.onUpdate("sponsors", data => (sponsors = data));

//* Request Handler
const handler: RequestHandler = (_, res) => {
	res.send(sponsors);
};

//* Export handler
export { handler };
