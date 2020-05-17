import { cache } from "../../../index";
import { changelogType } from "../types/changelog/changelogType";
import { GraphQLList, GraphQLString } from "graphql";

let changelogCache = cache.get("changelog");

cache.onUpdate("changelog", data => (changelogCache = data));

export const changelog = {
	type: GraphQLList(changelogType),
	args: {
		version: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { version: string }) {
		if (args.version)
			return changelogCache.filter(c => c.version === args.version);
		else return changelogCache;
	}
};
