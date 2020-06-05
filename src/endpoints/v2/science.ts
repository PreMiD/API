import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (req.method === "POST") {
		if (
			!req.body.identifier ||
			typeof req.body.identifier !== "string" ||
			!req.body.presences ||
			!Array.isArray(req.body.presences)
		) {
			res.sendStatus(400);
			return;
		}

		let data: any = {
			identifier: req.body.identifier,
			presences: req.body.presences,
			updated: Date.now()
		};

		if (req.body.platform) data.platform = req.body.platform;

		science
			.findOneAndUpdate(
				{ identifier: req.body.identifier },
				{
					$set: data
				},
				{ upsert: true }
			)
			.then(() => res.sendStatus(200))
			.catch(() => res.sendStatus(500));
	} else {
		let identifier;

		if (req.method === "DELETE") {
			if (!req.body.identifier) {
				res.sendStatus(400);
				return;
			}

			identifier = req.body.identifier;
		} else if (req.method === "GET") {
			if (!req.params.identifier) {
				res.sendStatus(400);
				return;
			}

			identifier = req.params.identifier;
		} else {
			res.sendStatus(405);
			return;
		}

		science
			.findOneAndDelete({ identifier: identifier })
			.then(response => {
				if (response.value) {
					if (req.method === "DELETE") res.sendStatus(200);
					else res.redirect("https://premid.app");
				} else res.sendStatus(404);
			})
			.catch(() => res.sendStatus(500));
	}
};

//* Export handler
export { handler };
