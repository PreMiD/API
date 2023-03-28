import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

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

export class Sponsors extends MongoDBCaching {
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
