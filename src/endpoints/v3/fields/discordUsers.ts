import { GraphQLList, GraphQLString } from "graphql";

import { cache } from "../../../index";
import { discordUserType } from "../types/discordUsers/discordUserType";

export const discordUsers = {
	type: GraphQLList(discordUserType),
	args: {
		userId: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { userId?: string }) {
		return args.userId
			? cache.get("discordUsers").filter(u => u.userId == args.userId)
			: cache.get("discordUsers");
	}
};
