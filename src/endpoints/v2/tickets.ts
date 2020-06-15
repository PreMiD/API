import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

const tickets = pmdDB.collection("tickets");
const credits = pmdDB.collection("credits");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["token"]) {
		//* send error
		//* return
		res.status(401).send({ error: 1, message: "No token providen." });
		return;
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			if (
				await credits.findOne({
					userId: dUser.id,
					roles: { $in: ["Staff Head"] }
				})
			) {
				res.send(
					await tickets.find({}, { projection: { _id: false } }).toArray()
				);
				return;
			}
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
