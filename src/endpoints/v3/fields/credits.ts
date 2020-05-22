import { cache } from "../../../index";
import { creditsType } from "../types/credits/credits";
import { GraphQLBoolean, GraphQLInt, GraphQLString } from "graphql";
import { GraphQLList } from "graphql/type/definition";

let creditsCache = prepareCredits(cache.get("credits"));

cache.onUpdate("credits", data => (creditsCache = prepareCredits(data)));

export const credits = {
	type: GraphQLList(creditsType),
	args: {
		id: { type: GraphQLString, defaultValue: null },
		limit: { type: GraphQLInt, defaultValue: null },
		random: { type: GraphQLBoolean, defaultValue: false }
	},
	resolve(_, args: { id?: string; limit?: number; random: false }) {
		let res = creditsCache;

		if (args.id) res.filter(c => c.user.id == args.id);
		if (args.random) res = shuffle(res);
		if (args.limit) res = res.slice(0, args.limit);

		return res;
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
			premium_since: c.premium_since,
			role: c.role,
			roleId: c.roleId,
			roleColor: c.roleColor,
			rolePosition: c.rolePosition
		},
		highestRole: {
			id: c.roleId,
			name: c.role
		},
		roles: c.roles.map((r, i) => ({ id: c.roleIds[i], name: r }))
	}));
}

function shuffle(array: Array<any>) {
	var currentIndex = array.length,
		temporaryValue: any,
		randomIndex: number;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
