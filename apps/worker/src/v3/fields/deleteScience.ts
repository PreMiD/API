import { gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import validator from "validator";

import { redis } from "../..";

export const schema = gql`
	type Mutation {
		deleteScience(identifier: String!): DeleteScienceResult
	}

	type DeleteScienceResult {
		identifier: String!
	}
`;

export async function resolver(_: any, params: { identifier: string }) {
	if (!validator.isUUID(params.identifier, "4"))
		return new GraphQLError("identifier must be a UUID v4.");

	await redis.hset(
		"pmd-api.scienceDeletes",
		params.identifier,
		params.identifier
	);

	return { identifier: params.identifier };
}

export const options = {
	type: "mutation"
};
