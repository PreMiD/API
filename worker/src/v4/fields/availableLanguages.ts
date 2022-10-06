import { gql } from "apollo-server-core";
import { getDirection, getNativeName } from "language-flag-colors";

import { Strings } from "./strings";

export const schema = gql`
	type Query {
		"""
		Get the available languages
		"""
		availableLanguages: [Language!]!
	}

	type Language {
		"""
		Language code
		"""
		lang: String!
		"""
		Native name of the language, eg. 'English', 'Deutsch', 'Español', etc.
		"""
		nativeName: String!
		"""
		'ltr' or 'rtl'
		"""
		direction: String!
	}
`;

export async function resolver(
	_: any,
	__: any,
	{ dataSources: { strings } }: { dataSources: { strings: Strings } }
) {
	return (await strings.distinct("lang", {})).map((l: string) => ({
		lang: l,
		nativeName: getNativeName(l) ?? "",
		direction: getDirection(l) ?? "ltr"
	}));
}
