import { gql } from "apollo-server-core";

import MongoDataSource from "../../classes/MongoDataSource";

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

	get(userId: string) {
		return this.findOne({ userId });
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
