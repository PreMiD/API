import Axios from "axios";
import { User } from "discord.js";

export function getExteralUser(id: string) {
	return new Promise<User>(async (resolve, reject) => {
		Axios("https://discord.com/api/v9/users/" + id, {
			headers: {
				Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN
			}
		})
			.then(({ data }) => resolve(data as User))
			.catch(reject);
	});
}
