import MongoDataSource from "apollo-mongodb-datasource";
import { gql } from "apollo-server-core";

export const schema = gql`
	type Query {
		partners(name: String): [Partner]
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

	get(name: string) {
		return this.findOne({ name });
	}
}

export async function resolver(
	_: any,
	args: { name?: string },
	{ dataSources: { partners } }: { dataSources: { partners: Partners } }
) {
	if (args.name?.trim().length) {
		const res = await partners.get(args.name);
		return res ? [res] : null;
	}

	return partners.getAll();
}
