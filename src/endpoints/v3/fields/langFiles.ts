import { cache } from "../../../index";
import { langFileType } from "../types/langFiles/langFileType";
import { GraphQLList, GraphQLString } from "graphql";

export const langFiles = {
	type: GraphQLList(langFileType),
	args: {
		lang: { type: GraphQLString, defaultValue: null },
		project: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { lang?: string; project?: string }) {
		return cache.get("langFiles").filter(lF => {
			let checksToPass = 2,
				checksThatPassed = 0;

			if (args.lang) {
				if (lF.lang === args.lang) checksThatPassed++;
			} else checksThatPassed++;

			if (args.project) {
				if (lF.project === args.project) checksThatPassed++;
			} else checksThatPassed++;

			return checksToPass === checksThatPassed;
		});
	}
};
