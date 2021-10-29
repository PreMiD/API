import { gql } from "apollo-server-core";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		usage: Usage
	}

	type Usage {
		count: Int
	}
`;

export class Usage extends MongoDataSource {
	get() {
		return this.count({}, { ttl: 5 * 60 });
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { usage } }: { dataSources: { usage: Usage } }
) {
	return { count: usage.get() };
}
