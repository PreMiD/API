import { cache } from "../../../index";
import { discordUserType } from "../types/discordUsers/discordUserType";
import { GraphQLList } from "graphql";

let discordUsersCache = cache.get("discordUsers");

cache.onUpdate("discordUsers", data => (discordUsersCache = data));

export const discordUsers = {
	type: GraphQLList(discordUserType),
	resolve() {
		return discordUsersCache;
	}
};
