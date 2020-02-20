import { RequestHandler } from "express";
import { cache } from "../../index";

let discordUsers = cache.get("discordUsers").map(u => {
	delete u._id;
	return u;
});

cache.onUpdate(
	"discordUsers",
	data =>
		(discordUsers = data.map(u => {
			delete u._id;
			return u;
		}))
);

//* Request Handler
const handler: RequestHandler = (_, res) => {
  res.send(discordUsers);
};

//* Export handler
export { handler };
