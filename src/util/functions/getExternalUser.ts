import Axios from "axios";

export function getExteralUser(id: string) {
	return new Promise<{
		id: string;
		username: string;
		avatar: string;
		discriminator: string;
		public_flags: string;
	}>(async (resolve, reject) => {
		Axios("https://discord.com/api/v8/users/" + id, {
			headers: {
				Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN
			}
		})
			.then(({ data }) => resolve(data))
			.catch(reject);
	});
}
