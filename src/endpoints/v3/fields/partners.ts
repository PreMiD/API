import { GraphQLString } from "graphql";
import { GraphQLList } from "graphql/type/definition";

import { partners as cache } from "../../../util/CacheManager";
import { partnerType } from "../types/partners/partnerType";

export const partners = {
	type: GraphQLList(partnerType),
	args: {
		name: { type: GraphQLString, defaultValue: null }
	},
	resolve(
		_,
		args: {
			name?: string;
		}
	) {
		let result = cache.values();

		if (args.name) {
			result = result.filter(p => p.name === args.name);
		}

		return result;
	}
};
