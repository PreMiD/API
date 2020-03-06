import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = (req, res) => {
	if (
		!req.body.identifier ||
		typeof req.body.identifier !== "string" ||
		!req.body.presences ||
		!Array.isArray(req.body.presences)
	) {
		res.sendStatus(404);
		return;
	}

	science
		.findOneAndUpdate(
			{ identifier: req.body.identifier },
			{
				$set: {
					identifier: req.body.identifier,
					presences: req.body.presences,
					updated: Date.now()
				}
			},
			{ upsert: true }
		)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(500));
};

//* Export handler
export { handler };
