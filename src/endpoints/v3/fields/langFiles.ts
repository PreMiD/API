import { GraphQLList, GraphQLString } from "graphql";

import { cache } from "../../../index";
import { langFileType } from "../types/langFiles/langFileType";

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

			lF.translations = formatLangFile(lF);

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

function formatLangFile(langFile) {
	return Object.assign(
		{},
		...Object.keys(langFile.translations).map(translationKey => {
			const newKey = translationKey.replace(/[_]/g, ".");
			return {
				[newKey]: langFile.translations[translationKey]
			};
		})
	);
}