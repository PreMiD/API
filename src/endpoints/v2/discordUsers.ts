import { cache } from "../../index";
import { RequestHandler } from "express";

let discordUsers = cache.get("discordUsers");

cache.onUpdate("discordUsers", data => (discordUsers = data));

//* Request Handler
const handler: RequestHandler = async (_, res) => {
	res.send(discordUsers);
};

//* Export handler
export { handler };
