import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

export const schema = gql`
	type Query {
		versions: Versions
	}

	type Versions {
		api: String
		app: String
		extension: String
		bot: String
		linux: String
		safari: SafariVersion
	}

	type SafariVersion {
		version: String
		urgent: Boolean
	}
`;

export class Versions extends MongoDBCaching {
	get() {
		return this.findOne({ key: 0 });
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { versions } }: { dataSources: { versions: Versions } }
) {
	return versions.get();
}
