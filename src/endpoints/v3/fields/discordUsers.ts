import { cache } from "../../../index";
import { discordUserType } from "../types/discordUsers/discordUserType";
import { GraphQLList, GraphQLString } from "graphql";

let discordUsersCache = cache.get("discordUsers");

cache.onUpdate("discordUsers", data => (discordUsersCache = data));

export const discordUsers = {
	type: GraphQLList(discordUserType),
	args: {
		userId: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { userId?: string }) {
		return args.userId
			? discordUsersCache.filter(u => u.userId == args.userId)
			: discordUsersCache;
	}
};
