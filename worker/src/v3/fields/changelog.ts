import { gql } from "apollo-server-core";

export const schema = gql`
	type Query {
		changelog(version: String): [Changelog]
	}

	type Changelog {
		version: String
		type: String
		string: String
		urls: [String]
		project: String
	}
`;
export function resolver() {
	//! Deprecated & Not used, added to prevent Extension issues
	return [];
}
