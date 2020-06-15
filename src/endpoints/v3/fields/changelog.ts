import { cache } from "../../../index";
import { changelogType } from "../types/changelog/changelogType";
import { GraphQLList, GraphQLString } from "graphql";

export const changelog = {
	type: GraphQLList(changelogType),
	args: {
		version: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { version: string }) {
		if (args.version)
			return cache.get("changelog").filter(c => c.version === args.version);
		else return cache.get("changelog");
	}
};
