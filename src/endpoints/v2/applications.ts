import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

const applications = pmdDB.collection("applications");
const credits = pmdDB.collection("credits");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["token"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No token providen." });
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
				res.send(await applications.find({}, { projection: { _id: false } }).toArray());
				return;
			}
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
