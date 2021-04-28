import { GraphQLList, GraphQLString } from "graphql";

import { changelog as cache } from "../../../util/CacheManager";
import { changelogType } from "../types/changelog/changelogType";

export const changelog = {
	type: GraphQLList(changelogType),
	args: {
		version: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { version: string }) {
		console.log(cache.values());
		if (args.version)
			return cache.values().filter(c => c.version === args.version);
		else return cache.values();
	}
};
