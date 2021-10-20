import axios from "axios";
import { RouteHandlerMethod } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";

const base = axios.create({
	baseURL: "https://accounts.crowdin.com/"
});

interface CrowdinUser {
	data: {
		id: Number;
		username: String;
		email: String;
		fullName: String;
		avatarUrl: String;
		createdAt: String;
		lastSeen: String;
		twoFactor: String;
		timezone: String;
	};
}

interface CrowdinAuth {
	access_token: String;
	token_type: String;
	expires_in: Number;
	refresh_token: String;
}

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const hostname =
			process.env.NODE_ENV === "production" ? "premid.app" : "localhost:3000",
		query = req.query as any;

	if (query?.error === "access_denied") {
		await pmdDB.collection("crowdin").findOneAndDelete({ code: query.state });
		return res.redirect(
			encodeURI(
				`//${hostname}/crowdin?success=false&error=Authorization canceled.`
			)
		);
	}

	if (!query?.code || !query?.state)
		return res.redirect(
			encodeURI(
				`//${
					process.env.NODE_ENV === "production"
						? "premid.app"
						: "localhost:3000"
				}/crowdin?success=false&error=No code or state supplied.`
			)
		);

	const codeValid = await pmdDB
		.collection("crowdin")
		.findOne({ code: query.state });

	if (!codeValid)
		return res.redirect(
			encodeURI(`//${hostname}/crowdin?success=false&error=Invalid code.`)
		);

	try {
		const { token_type, access_token }: CrowdinAuth = (
				await base("oauth/token", {
					method: "POST",
					data: {
						grant_type: "authorization_code",
						client_id: process.env.CROWDIN_CLIENT_ID,
						client_secret: process.env.CROWDIN_CLIENT_SECRET,
						redirect_uri: `http${
							process.env.NODE_ENV === "production"
								? "s://api.premid.app"
								: "://localhost:3001"
						}/crowdin`,
						code: query.code
					}
				})
			).data as any,
			user = (
				(
					await axios("https://api.crowdin.com/api/v2/user", {
						headers: { Authorization: `${token_type} ${access_token}` }
					})
				).data as CrowdinUser
			).data;

		await pmdDB
			.collection("crowdin")
			.findOneAndUpdate(
				{ code: query.state },
				{ $set: { user }, $unset: { code: true } }
			);
		res.redirect(encodeURI(`//${hostname}/crowdin?success=true`));
	} catch (err) {
		console.log(err);
		await pmdDB.collection("crowdin").findOneAndDelete({ code: query.state });

		return res.redirect(
			encodeURI(
				`//${hostname}/crowdin?success=false&error=Crowdin token invalid.`
			)
		);
	}
};

export { handler };
