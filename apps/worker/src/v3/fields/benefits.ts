import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

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

export class Benefits extends MongoDBCaching {
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
