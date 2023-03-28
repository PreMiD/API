import { gql } from "apollo-server-core";

import { Usage } from "./usage";

export const schema = gql`
	type Query {
		science: Science
	}

	type Science {
		users: Int
	}
`;

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { usage } }: { dataSources: { usage: Usage } }
) {
	return { users: usage.get() };
}
