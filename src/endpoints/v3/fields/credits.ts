import { cache } from "../../../index";
import { creditsType } from "../types/credits/credits";
import { GraphQLList } from "graphql/type/definition";
import { GraphQLString } from "graphql";

let creditsCache = prepareCredits(cache.get("credits"));

cache.onUpdate("credits", data => (creditsCache = prepareCredits(data)));

export const credits = {
	type: GraphQLList(creditsType),
	args: {
		id: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { id?: string }) {
		if (args.id) return creditsCache.filter(c => c.user.id === args.id);
		else return creditsCache;
	}
};

function prepareCredits(credits) {
	return credits.map(c => ({
		user: {
			name: c.name,
			id: c.userId,
			tag: c.tag,
			avatar: c.avatar,
			status: c.status,
			flags: c.flags,
			premium_since: c.premium_since
		},
		highestRole: {
			id: c.roleId,
			name: c.role
		},
		roles: c.roles.map((r, i) => ({ id: c.roleIds[i], name: r }))
	}));
}
