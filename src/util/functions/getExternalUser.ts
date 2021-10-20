import Axios from "axios";

interface DiscordUser {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
	verified: boolean;
	locale: string;
	mfa_enabled: boolean;
	flags: number;
	premium_type: number;
}

export function getExteralUser(id: string) {
	return new Promise<DiscordUser>(async (resolve, reject) => {
		Axios("https://discord.com/api/v9/users/" + id, {
			headers: {
				Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN
			}
		})
			.then(({ data }) => resolve(data as DiscordUser))
			.catch(reject);
	});
}
