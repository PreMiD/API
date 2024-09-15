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

	// * Use Redis Hash with 'service' in the key to store heartbeat data
	const redisKey = `pmd-api.heartbeatUpdates.${params.identifier}`;
	await redis.hset(redisKey, {
		service: params.presence?.service,
		version: params.presence?.version,
		language: params.presence?.language,
		since: params.presence?.since.toString(),
		extension_version: params.extension.version,
		extension_language: params.extension.language,
		extension_connected_app: params.extension.connected?.app?.toString(),
		extension_connected_discord: params.extension.connected?.discord?.toString()
	});
	await redis.expire(redisKey, 300);

	return {
		__typename: "HeartbeatResult",
		identifier: params.identifier,
		presence: params.presence,
		extension: params.extension
	};
}

export const options = {
	type: "mutation"
};
