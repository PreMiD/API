import MongoDataSource from "apollo-mongodb-datasource";
import { gql } from "apollo-server-core";
import { getDirection, getLocale, getNativeName } from "language-flag-colors";
import { cloneDeep } from "lodash";

export const schema = gql`
	type Query {
		"""
		Get Strings for a specific language, project and presence
		"""
		strings(
			"""
			Language code
			"""
			lang: String
			"""
			Project, possible values: 'extension', 'presence', 'website'
			"""
			project: String
			"""
			Presence, e.g. 'Netflix'
			"""
			presence: StringOrStringArray
		): [LanguageStrings]
	}

	type LanguageStrings {
		"""
		Language code
		"""
		lang: String
		"""
		Native name of the language, eg. 'English', 'Deutsch', 'Español', etc.
		"""
		nativeName: String
		"""
		'ltr' or 'rtl'
		"""
		direction: String
		"""
		Project, possible values: 'extension', 'presence', 'website'
		"""
		project: String
		"""
		Presence, e.g. 'Netflix'
		"""
		presence: String
		"""
		Strings in the language
		"""
		translations: Scalar
	}
`;

interface MongoStrings {
	lang: string;
	project: "extension" | "presence" | "website";
	translations: Record<string, string>;
}

type ReturnMongoStrings = MongoStrings & {
	nativeName: string;
	direction: "ltr" | "rtl";
};

export class Strings extends MongoDataSource<MongoStrings> {
	async getAll(): Promise<ReturnMongoStrings[]> {
		let strings = await this.find({}, { ttl: 5 * 60 });

		for (const l of strings)
			for (const t of Object.entries(l.translations)) {
				l.translations[t[0].replace(/[_]/g, ".")] = t[1];
				delete l.translations[t[0]];
			}

		return strings.map(l => ({
			...l,
			nativeName: getNativeName(l.lang) ?? "",
			direction: getDirection(l.lang) ?? "ltr"
		}));
	}

	async get(args: {
		lang?: string;
		project?: "extension" | "presence" | "website";
		presence?: string | string[];
	}): Promise<ReturnMongoStrings[]> {
		if (args.lang)
			args.lang = getLocale(args.lang.replace("_", "-")) ?? args.lang;

		console.log(args.lang);
		const findArgs = cloneDeep(args);
		delete findArgs.presence;

		if (args.presence) findArgs.project = "presence";

		let strings = await this.find(findArgs, { ttl: 5 * 60 });

		for (const lang of strings)
			for (const string of Object.entries(lang.translations)) {
				delete lang.translations[string[0]];

				string[0] = string[0].replace(/_/g, ".");

				if (args.presence) {
					//* Return general strings if arg is empty array or string
					if (!args.presence.length) {
						if (!string[0].startsWith("general")) continue;

						lang.translations[string[0]] = string[1];
						continue;
					}

					if (Array.isArray(args.presence)) {
						if (
							string[0].match(
								new RegExp(`(${args.presence.join("|").toLowerCase()})..*`)
							)
						)
							lang.translations[string[0]] = string[1];

						continue;
					}

					if (string[0].startsWith(args.presence.toLocaleLowerCase()))
						lang.translations[string[0]] = string[1];

					continue;
				}

				lang.translations[string[0]] = string[1];
			}

		return strings.map(l => ({
			...l,
			nativeName: getNativeName(l.lang) ?? "",
			direction: getDirection(l.lang) ?? "ltr"
		}));
	}
}

export function resolver(
	_: any,
	args: {
		lang?: string;
		project?: "extension" | "presence" | "website";
		presence?: string | string[];
	},
	{ dataSources: { strings } }: { dataSources: { strings: Strings } }
) {
	if (!Object.keys(args).length) return strings.getAll();

	return strings.get(args);
}
