import { GraphQLList, GraphQLString } from "graphql";

import { discordUsers as cache } from "../../../util/CacheManager";
import { discordUserType } from "../types/discordUsers/discordUserType";

export const discordUsers = {
	type: GraphQLList(discordUserType),
	args: {
		userId: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { userId?: string }) {
		return args.userId
			? cache.values().filter(u => u.userId == args.userId)
			: cache.values();
	}
};
