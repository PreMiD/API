import axios from "axios";
import { RESTGetAPICurrentUserResult } from "discord-api-types/v9";

export default async function (token: string) {
	return (
		await axios("https://discord.com/api/v9/users/@me", {
			headers: { Authorization: token }
		})
	).data as RESTGetAPICurrentUserResult;
}
