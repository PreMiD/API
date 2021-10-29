import axios from "axios";
import { RESTGetAPICurrentUserResult } from "discord-api-types";

export default async function (token: string) {
	return (
		await axios("https://discord.com/api/users/@me", {
			headers: { Authorization: token }
		})
	).data as RESTGetAPICurrentUserResult;
}
