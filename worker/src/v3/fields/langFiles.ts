import { gql } from "apollo-server-core";
import { cloneDeep } from "lodash";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		langFiles(lang: String, project: String, presence: String): [LangFile]
	}

	type LangFile {
		lang: String
		project: String
		presence: String
		translations: Scalar
	}
`;

export class LangFiles extends MongoDataSource {
	async getAll() {
		let langFiles = await this.find({}, { ttl: 5 * 60 });

		for (const l of langFiles)
			for (const t of Object.entries(l.translations)) {
				l.translations[t[0].replace(/[_]/g, ".")] = t[1];
				delete l.translations[t[0]];
			}

		return langFiles;
	}

	async get(args: { lang?: string; project?: string; presence?: string }) {
		const findArgs = cloneDeep(args);
		delete findArgs.presence;

		if (args.presence) findArgs.project = "presence";

		let langFiles = await this.find(findArgs, { ttl: 5 * 60 });

		for (const l of langFiles)
			for (const t of Object.entries(l.translations)) {
				delete l.translations[t[0]];

				if (args.presence) {
					if (
						t[0].startsWith(args.presence.toLocaleLowerCase()) ||
						t[0].startsWith("general")
					)
						l.translations[t[0].replace(/[_]/g, ".")] = t[1];
				} else {
					l.translations[t[0].replace(/[_]/g, ".")] = t[1];
				}
			}

		return langFiles;
	}
}

export function resolver(
	_: any,
	args: { lang?: string; project?: string; presence?: string },
	{ dataSources: { langFiles } }: { dataSources: { langFiles: LangFiles } }
) {
	if (!Object.keys(args).length) return langFiles.getAll();

	return langFiles.get(args);
}
