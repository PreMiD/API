import { WebhookClient } from "discord.js";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

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

	if (
		!body.type ||
		!body.name ||
		!body.link ||
		!body.description ||
		!body.imageLink ||
		!body.token
	) {
		res.status(400).send({ error: 1, message: "Missing fields." });
		return;
	}

	getDiscordUser(body.token)
		.then(async dUser => {
			if (
				await coll.findOne({
					type: "partner",
					userId: dUser.id,
					reviewed: false
				})
			) {
				res
					.status(400)
					.send({ error: 3, message: "You already applied before." });
				return;
			}

			res.send(200);

			coll.insertOne({
				type: "partner",
				userId: dUser.id,
				reviewed: false,
				pType: body.type,
				name: body.name,
				link: body.link,
				description: body.description,
				imageLink: body.imageLink
			});

			webhook.send("", {
				embeds: [
					{
						title: `Partner Application (${body.type})`,
						description: `By <@${dUser.id}>`,
						fields: [
							{
								name: "Type",
								value: body.type,
								inline: false
							},
							{
								name: "Name",
								value: body.name,
								inline: false
							},
							{
								name: "URL",
								value: body.link,
								inline: false
							},
							{
								name: "Description",
								value: body.description,
								inline: false
							}
						],
						thumbnail: {
							url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
						},
						image: {
							url: body.imageLink
						}
					}
				]
			});
		})
		.catch(() => res.send({ error: 2, message: "Invalid token." }));
};

//* Export handler
export { handler };
