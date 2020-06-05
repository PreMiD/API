import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

const coll = pmdDB.collection("bugs");
const coll2 = pmdDB.collection("bugUsers");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.body.brief) {
		return res
			.status(401)
			.send({ error: 1, message: "No Bug brief providen." });
	}

	if (!req.body.description) {
		return res
			.status(401)
			.send({ error: 2, message: "No Bug description providen." });
	}
	if (!req.body.token) {
		return res.status(401).send({ error: 3, message: "No token providen." });
	}

	getDiscordUser(req.params["token"])
		.then(async dUser => {
			await coll2.findOneAndUpdate(
				{ userId: dUser.id },
				{
					$setOnInsert: {
						userId: dUser.id,
						total: 0,
						count: 3
					}
				},
				{ upsert: true }
			);

			const result = await coll2.updateOne(
				{ userId: dUser.id, count: { $gt: 0 } },
				{ $inc: { total: +1, count: -1 } }
			);

			if (result.modifiedCount === 0)
				return res.status(403).send("Too many active reports");

			await coll.insertOne({
				brief: req.body.brief,
				system: req.body.system,
				description: req.body.description,
				status: req.body.status,
				date: req.body.date,
				userName: dUser.username + "#" + dUser.discriminator,
				userId: dUser.id
			});

			res.sendStatus(200);
		})
		.catch(err => {
			res.sendStatus(401);
		});
};

//* Export handler
export { handler };
