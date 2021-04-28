import { GraphQLList, GraphQLString } from "graphql";

import { langFiles as cache } from "../../../util/CacheManager";
import { langFileType } from "../types/langFiles/langFileType";

export const langFiles = {
	type: GraphQLList(langFileType),
	args: {
		lang: { type: GraphQLString, defaultValue: null },
		project: { type: GraphQLString, defaultValue: null },
		presence: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { lang?: string; project?: string; presence?: string }) {
		let masterLangKeys;
		if (args.presence) {
			args.presence = args.presence.toLowerCase();
			masterLangKeys = Object.keys(
				formatLangFile(
					cache
						.values()
						.filter(lF => lF.project === "presence" && lF.lang === "en")[0]
				)
			);

			if (!masterLangKeys.some(key => key.startsWith(`${args.presence}.`))) {
				masterLangKeys = null;
			} else {
				masterLangKeys = masterLangKeys.filter(
					key =>
						key.startsWith(`general.`) || key.startsWith(`${args.presence}.`)
				);
			}
		}

		return cache.values().filter(lF => {
			let checksToPass = 3,
				checksThatPassed = 0;

			lF.translations = formatLangFile(lF);

			if (args.lang) {
				if (lF.lang === args.lang) checksThatPassed++;
			} else checksThatPassed++;

			if (args.project) {
				if (lF.project === args.project) checksThatPassed++;
			} else checksThatPassed++;

			if (args.presence) {
				const keys = Object.keys(lF.translations).filter(
					key =>
						key.startsWith(`general.`) || key.startsWith(`${args.presence}.`)
				);

				if (masterLangKeys && masterLangKeys.length == keys.length) {
					checksThatPassed++;
				}
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
