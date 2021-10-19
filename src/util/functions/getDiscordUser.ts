import Axios from "axios";
import { User } from "discord.js";

export function getDiscordUser(token: string) {
	return new Promise<User>(async (resolve, reject) => {
		Axios("https://discord.com/api/users/@me", {
			headers: { Authorization: token }
		})
			.then(({ data }) => resolve(data as User))
			.catch(reject);
	});
}
