import Axios from "axios";

export function getDiscordUser(token: string) {
	return new Promise<{
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
	}>(async (resolve, reject) => {
		Axios("https://discordapp.com/api/users/@me", {
			headers: { Authorization: token }
		})
			.then(({ data }) => resolve(data))
			.catch(reject);
	});
}
