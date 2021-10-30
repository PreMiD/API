import MongoDataSource from "apollo-mongodb-datasource";
import { gql } from "apollo-server-core";

export const schema = gql`
	type Query {
		partners: [Partner]
	}

	type Partner {
		name: String!
		description: String!
		image: String!
		tString: String!
		storeName: String!
		url: String!
	}
`;

export class Partners extends MongoDataSource {
	getAll() {
		return this.find();
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { partners } }: { dataSources: { partners: Partners } }
) {
	return partners.getAll();
}
