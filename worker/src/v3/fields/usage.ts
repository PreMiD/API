import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

export const schema = gql`
	type Query {
		usage: Usage
	}

	type Usage {
		count: Int
	}
`;

export class Usage extends MongoDBCaching {
	get() {
		return this.countDocuments({}, { ttl: 5 * 60 });
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { usage } }: { dataSources: { usage: Usage } }
) {
	return { count: usage.get() };
}
