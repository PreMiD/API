import { RequestHandler } from "express";
import axios from "axios";

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	await axios
		.post(
			`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body.gresponse}`,
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" }
			}
		)
		.then(async data => {
			if (data.data.success) {
				await axios
					.post(`${process.env.DISCORD_WEBHOOK}`, {
						username: "Partner Applications",
						embeds: [
							{
								title: "New partner application",
								description: `**Name**: ${req.body.name}\n**Type**: ${req.body.type}\n**URL**: ${req.body.link}\n**Description:** ${req.body.description}\n\n ~ ${req.body.discordUser.userTag} / <@${req.body.discordUser.userId}>`,
								thumbnail: {
									url: req.body.imageLink
								}
							}
						]
					})
					.then(function(response) {
						res.sendStatus(200);
					})
					.catch(function(err) {
						if (err)
							res.send({ status: 500, message: "Error posting to Discord Webhook." });
						console.log(err);
					});
			} else res.sendStatus(401);
		})
		.catch(err => {
			if (err) res.send({ status: 500, message: "Error posting to Google." });
			console.log(err);
		});
};

//* Export handler
export { handler };
