import { cache } from "../../index";
import { RequestHandler } from "express";

let credits = cache.get("credits");

cache.onUpdate("credits", data => (credits = data));

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	//* user param not set
	if (!req.params["userId"]) {
		//* Send all users
		//* return
		res.send(credits);
		return;
	}

	//* find user
	//* Return user if found
	//* Else return error
	const user = credits.find(c => c.userId === req.params["userId"]);

	if (user) res.send(user);
	else res.send({ error: 2, message: "User not found." });
};

//* Export handler
export { handler };
