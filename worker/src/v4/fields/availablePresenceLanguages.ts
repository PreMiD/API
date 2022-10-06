import { gql } from "apollo-server-core";

import { Strings } from "./strings";

export const schema = gql`
	type Query {
		"""
		Get the available presence languages for a specific presence
		"""
		availablePresenceLanguages(
			"""
			Presence, e.g. 'Netflix'
			"""
			presence: StringOrStringArray
		): [Language!]!
	}
`;

export async function resolver(
	_: any,
	args: {
		presence?: string | string[];
	},
	{ dataSources: { strings } }: { dataSources: { strings: Strings } }
) {
	const fetchedStrings = await strings.get(args),
		englishStrings = fetchedStrings.find(s => s.lang === "en-US") ?? {
			translations: {}
		},
		// String count of the English strings by first name
		englishStringCount: {
			[key: string]: number;
		} = {};

	for (const key of Object.keys(englishStrings.translations)) {
		const [firstName] = key.split(".");
		englishStringCount[firstName] = (englishStringCount[firstName] ?? 0) + 1;
	}

	return fetchedStrings
		.filter(s => {
			const fetchedStringCount: {
				[key: string]: number;
			} = {};

			for (const key of Object.keys(s.translations)) {
				const [firstName] = key.split(".");
				fetchedStringCount[firstName] =
					(fetchedStringCount[firstName] ?? 0) + 1;
			}

			// Check if the fetched language has 60% of the strings translated per first name
			for (const firstName of Object.keys(englishStringCount)) {
				const sixtyPercent = englishStringCount[firstName] * 0.6;

				if (
					!(firstName in fetchedStringCount) ||
					fetchedStringCount[firstName] < sixtyPercent
				)
					return false;
			}

			return true;
		})
		.map(s => ({
			lang: s.lang,
			nativeName: s.nativeName,
			direction: s.direction
		}));
}
