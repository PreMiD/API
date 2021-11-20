import MongoDataSource from "apollo-mongodb-datasource";
import { gql } from "apollo-server-core";
import axios from "axios";

export const schema = gql`
	type Query {
		discordUsers(userId: String): [DiscordUser]
	}

	type DiscordUser {
		avatar: String
		created: Float
		userId: String
		username: String
		discriminator: String
	}
`;

export class DiscordUsers extends MongoDataSource {
	getAll() {
		return this.find({}, { ttl: 5 * 60 });
	}

	async get(userId: string) {
		let user = (await this.findOne({ userId })) as any;

		if (process.env.BOT_TOKEN && !user) {
			try {
				try {
					user = JSON.parse(
						(await this.cache?.get(`pmd-api.discordUsers.${userId}`)) || ""
					);
				} catch (err) {}

				if (!user) {
					user = (
						await axios({
							baseURL: "https://discord.com/api/users",
							url: userId,
							headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
						})
					).data;

					await this.cache?.set(
						`pmd-api.discordUsers.${userId}`,
						JSON.stringify(user)
					);
				}

				user.userId = user.id;
				user.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;
			} catch (err) {
				console.log(err);
			}
		}

		return user;
	}
}

export function resolver(
	_: any,
	args: { userId?: string },
	{
		dataSources: { discordUsers }
	}: { dataSources: { discordUsers: DiscordUsers } }
) {
	if (args.userId) return [discordUsers.get(args.userId)];
	else return discordUsers.getAll();
}
