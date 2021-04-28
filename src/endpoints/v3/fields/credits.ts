import { GraphQLBoolean, GraphQLInt, GraphQLString } from "graphql";
import { GraphQLList } from "graphql/type/definition";

import { CacheEventHandler, credits as cache } from "../../../util/CacheManager";
import { getExteralUser } from "../../../util/functions/getExternalUser";
import { creditsType } from "../types/credits/credits";

let creditsCache = prepareCredits(cache.values());

CacheEventHandler.on(
	"credits",
	() => (creditsCache = prepareCredits(cache.values()))
);

export const credits = {
	type: GraphQLList(creditsType),
	args: {
		id: { type: GraphQLString, defaultValue: null },
		limit: { type: GraphQLInt, defaultValue: null },
		random: { type: GraphQLBoolean, defaultValue: false }
	},
	resolve(_, args: { id?: string; limit?: number; random: false }) {
		let res = creditsCache;

		if (args.id) res = res.filter(c => c.user.id === args.id);
		if (args.random) res = shuffle(res);
		if (args.limit) res = res.slice(0, args.limit);

		if (res[0] != null) return res;
		if (res.length === 0 && args.id) {
			res.push(fetchUser(args.id));
			return res;
		} else {
			return res;
		}
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
		roles: c.roles?.map((r, i) => ({ id: c.roleIds[i], name: r }))
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

function fetchUser(id: string) {
	return new Promise((resolve, reject) => {
		getExteralUser(id)
			.then(async dUser => {
				const user = await dUser;
				return resolve({
					user: {
						name: user["username"],
						id: user["id"],
						tag: user["discriminator"],
						avatar:
							"https://cdn.discordapp.com/avatars/" +
							user["id"] +
							"/" +
							user["avatar"],
						flags: user["public_flags"]
					}
				});
			})
			.catch(err => {
				return resolve(null);
			});
	});
}
