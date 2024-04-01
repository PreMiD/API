import { gql, UserInputError } from "apollo-server-core";
import validator from "validator";

import { redis } from "../..";

export const schema = gql`
	type Mutation {
		heartbeat(
			identifier: String!
			presence: HeartbeatPresenceInput
			extension: HeartbeatExtensionInput!
		): HeartbeatResult!
	}

	input HeartbeatPresenceInput {
		service: String!
		version: String!
		language: String!
		since: Float!
	}

	input HeartbeatExtensionInput {
		version: String!
		language: String!
		connected: HeartbeatConnectedInput
	}

	input HeartbeatConnectedInput {
		app: Int!
		discord: Boolean!
	}

	type HeartbeatResult {
		identifier: String!
		presence: HeartbeatPresence
		extension: HeartbeatExtension!
	}

	type HeartbeatPresence {
		service: String!
		version: String!
		language: String!
		since: Float!
	}

	type HeartbeatExtension {
		version: String!
		language: String!
		connected: HeartbeatConnected
	}

	type HeartbeatConnected {
		app: Int!
		discord: Boolean!
	}
`;

export async function resolver(
	_: any,
	params: {
		identifier: string;
		presence?: {
			service: string;
			version: string;
			language: string;
			since: number;
		};
		extension: {
			version: string;
			language: string;
			connected?: {
				app: number;
				discord: boolean;
			};
		};
	}
) {
	if (!validator.isUUID(params.identifier, "4"))
		return new UserInputError("identifier must be a UUID v4.");

	const data = {
		identifier: params.identifier,
		presence: params.presence,
		extension: params.extension
	};

	//! Disabled for now
	/* await redis.setex(
		`pmd-api.heartbeatUpdates.${data.identifier}`,
		// 5 minutes
		300,
		JSON.stringify(data)
	); */

	return data;
}

export const options = {
	type: "mutation"
};
