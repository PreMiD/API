import { RequestHandler } from "express";
import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { WebhookClient } from "discord.js";

const coll = pmdDB.collection("applications");
const webhook = new WebhookClient(
	process.env.DISCORD_WEBHOOK_ID,
	process.env.DISCORD_WEBHOOK_TOKEN
);

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (
		!req.body.type ||
		!req.body.name ||
		!req.body.link ||
		!req.body.description ||
		!req.body.imageLink ||
		!req.body.token
	) {
		res.send({ error: 1, message: "Missing fields." });
		return;
	}

	getDiscordUser(req.body.token)
		.then(async dUser => {
			if (
				await coll.findOne({
					type: "partner",
					userId: dUser.id,
					reviewed: false
				})
			) {
				res.send({ error: 3, message: "You already applied before." });
				return;
			}

			res.sendStatus(200);

			coll.insertOne({
				type: "partner",
				userId: dUser.id,
				reviewed: false,
				pType: req.body.type,
				name: req.body.name,
				link: req.body.link,
				description: req.body.description,
				imageLink: req.body.imageLink
			});

			webhook.send("", {
				embeds: [
					{
						title: `Partner Application (${req.body.type})`,
						description: `By <@${dUser.id}>`,
						fields: [
							{
								name: "Type",
								value: req.body.type,
								inline: false
							},
							{
								name: "Name",
								value: req.body.name,
								inline: false
							},
							{
								name: "URL",
								value: req.body.link,
								inline: false
							},
							{
								name: "Description",
								value: req.body.description,
								inline: false
							}
						],
						thumbnail: {
							url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
						},
						image: {
							url: req.body.imageLink
						}
					}
				]
			});
		})
		.catch(() => res.send({ error: 2, message: "Invalid token." }));
};

//* Export handler
export { handler };
