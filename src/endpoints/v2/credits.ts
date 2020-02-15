import { RequestHandler } from "express";
import { cache } from "../../index";

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	const credits = cache.get("credits");

	//* user param not set
	if (!req.params["userId"]) {
		//* Send all users
		//* return
		res.send(
			credits.map(c => {
				delete c._id;
				return c;
			})
		);
		return;
	}

	//* find user
	//* Return user if found
	//* Else return error
	const user = await credits.findOne(
		{ userId: req.params["userId"] },
		{ projection: { _id: false } }
	);
	if (user) res.send(user);
	else res.send({ error: 2, message: "User not found." });
};

//* Export handler
export { handler };
