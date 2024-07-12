import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";
import { mongodb } from "../..";

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

export async function resolver(
	_: any,
	_1: any,
	{ dataSources: { usage } }: { dataSources: { usage: Usage } }
) {
	const users = await usage.keyv.get("users");
	if (!users) {
		const estimate = await mongodb
			.db("PreMiD")
			.collection("science")
			.estimatedDocumentCount();
		await usage.keyv.set("users", estimate);
		return { count: estimate };
	}
	return { count: users };
}
