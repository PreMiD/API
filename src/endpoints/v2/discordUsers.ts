import { RequestHandler } from "express";
import { cache } from "../../index";

let discordUsers = cache.get("discordUsers");

cache.onUpdate("discordUsers", data => (discordUsers = data));

//* Request Handler
const handler: RequestHandler = (_, res) => {
      res.send(discordUsers);
};

//* Export handler
export { handler };
