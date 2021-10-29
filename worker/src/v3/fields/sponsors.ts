import { gql } from "apollo-server-core";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		sponsors: [Sponsor]
	}

	type Sponsor {
		name: String!
		description: String!
		image: String!
		tString: String!
	}
`;

export class Sponsors extends MongoDataSource {
	getAll() {
		return this.find();
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { sponsors } }: { dataSources: { sponsors: Sponsors } }
) {
	return sponsors.getAll();
}
