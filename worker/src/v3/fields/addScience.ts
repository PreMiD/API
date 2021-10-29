import { gql } from "apollo-server-core";
import { GraphQLError } from "graphql";
import validator from "validator";

import { redis } from "../..";

export const schema = gql`
	type Mutation {
		addScience(
			identifier: String!
			presences: [String]
			os: String
			arch: String
		): AddScienceResult
	}

	type AddScienceResult {
		identifier: String
		presences: [String]
		os: String
		arch: String
	}
`;

export async function resolver(
	_: any,
	params: { identifier: string; presences: string[]; os: string; arch: string }
) {
	if (!validator.isUUID(params.identifier, "4"))
		return new GraphQLError("identifier must be a UUID v4.");

	const data = {
		identifier: params.identifier,
		presences: params.presences.filter(p => p.trim().length),
		platform: {
			os: params.os,
			arch: params.arch
		}
	};

	await redis.hset(
		"pmd-api.scienceUpdates",
		params.identifier,
		JSON.stringify(data)
	);

	return data;
}

export const options = {
	type: "mutation"
};
