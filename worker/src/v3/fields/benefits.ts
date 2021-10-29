import { gql } from "apollo-server-core";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		benefits: [Benefit]
	}

	type Benefit {
		icon: String!
		description: String!
		title: String!
	}
`;

export class Benefits extends MongoDataSource {
	getAll() {
		return this.find();
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { benefits } }: { dataSources: { benefits: Benefits } }
) {
	return benefits.getAll();
}
