import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { WebhookClient } from "discord.js";

const coll = pmdDB.collection("applications");
const webhook = new WebhookClient(
	process.env.DISCORD_WEBHOOK_ID,
	process.env.DISCORD_WEBHOOK_TOKEN
);

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.body.token) {
		res.send({ error: 1, message: "No token providen." });
		return;
	}

	if (!req.body.questions) {
		res.send({ error: 2, message: "No questions providen." });
		return;
	}

	getDiscordUser(req.body.token).then(async dUser => {
		if (
			await coll.findOne({ type: "job", userId: dUser.id, reviewed: false })
		) {
			res.send({ error: 3, message: "You already applied before." });
			return;
		}

		res.sendStatus(200);

		coll.insertOne({
			type: "job",
			userId: dUser.id,
			reviewed: false,
			position: { name: req.body.position, questions: req.body.questions }
		});

		webhook.send({
			embeds: [
				{
					title: `Job Application (${req.body.position})`,
					description: `By <@${dUser.id}>`,
					fields: req.body.questions.map(q => {
						return {
							name: q.label,
							value: q.response ? q.response : "No response."
						};
					}),
					thumbnail: {
						url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
					}
				}
			]
		});
	});
};

//* Export handler
export { handler };
