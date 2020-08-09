import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { WebhookClient } from "discord.js";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

const coll = pmdDB.collection("applications");
const webhook = new WebhookClient(
	process.env.DISCORD_WEBHOOK_ID,
	process.env.DISCORD_WEBHOOK_TOKEN
);

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const body = req.body as any;

	if (!body.token) {
		res.status(400).send({ error: 1, message: "No token providen." });
		return;
	}

	if (!body.questions) {
		res.status(400).send({ error: 2, message: "No questions providen." });
		return;
	}

	getDiscordUser(body.token).then(async dUser => {
		if (
			await coll.findOne({ type: "job", userId: dUser.id, reviewed: false })
		) {
			res
				.status(400)
				.send({ error: 3, message: "You already applied before." });
			return;
		}

		res.send(200);

		coll.insertOne({
			type: "job",
			userId: dUser.id,
			reviewed: false,
			position: { name: body.position, questions: body.questions }
		});

		webhook.send({
			embeds: [
				{
					title: `Job Application (${body.position})`,
					description: `By <@${dUser.id}>`,
					fields: body.questions.map(q => {
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
