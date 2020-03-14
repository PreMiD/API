import { RequestHandler } from "express";
import axios from "axios";

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	//! Decide if we will use Google Recaptcha. I know this is a mess, sorry :omegalul:

	interface Embed {
		title: String;
		description: String;
		fields: Array<{ name: String; value: String; inline?: boolean }>;
	}

	var questions: String = "",
		embed: Embed = { title: "", description: "", fields: [] };

	embed.title = "New job application";
	embed.description = `User: <@${req.body.discordUser.id}>\n${questions}`;

	req.body.questions.map(question => {
		embed.fields.push({
			name: `**${question.label}**`,
			value: question.response ? question.response : "No response."
		});
	});

	await axios
		.post(`${process.env.DISCORD_WEBHOOK}`, {
			username: "Job Applications",
			embeds: [embed]
		})
		.then(function(response) {
			res.sendStatus(200);
		})
		.catch(function(err) {
			if (err)
				res.send({ status: 500, message: "Error posting to Discord Webhook." });
			console.log(err);
		});
};

//* Export handler
export { handler };
