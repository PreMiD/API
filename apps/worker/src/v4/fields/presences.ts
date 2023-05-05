import { gql } from "apollo-server-core";

import Presences from "../../v3/fields/presences";

interface PresenceQueryArgs {
	service?: string | string[];
	author?: string;
	contributor?: string;
	start?: number;
	limit?: number;
	query?: string;
	tag?: string;
}

export const schema = gql`
	type Query {
		presences(
			service: StringOrStringArray
			author: String
			contributor: String
			start: Int
			limit: Int
			query: String
			tag: String
		): [Presence!]!
	}

	type Presence {
		url: String!
		metadata: PresenceMetadata!
		presenceJs: String!
		iframeJs: String
		users: Int!
	}

	type PresenceMetadata {
		author: PresenceMetadataUser!
		contributors: [PresenceMetadataUser!]
		altnames: [String!]
		service: String!
		description: Scalar! # serialize
		url: Scalar! # serialize
		version: String!
		logo: String!
		thumbnail: String!
		color: String!
		tags: [String!]!
		category: String!
		iframe: Boolean
		regExp: String
		iFrameRegExp: String
		readLogs: Boolean
		button: Boolean
		warning: Boolean
		settings: [PresenceMetadataSettings!]
	}

	type PresenceMetadataUser {
		id: String!
		name: String!
	}

	type PresenceMetadataSettings {
		id: String!
		title: String
		icon: String
		if: PresenceMetadataSettingsIf # serialize
		placeholder: String
		value: Scalar # serialize
		values: Scalar # serialize
		multiLanguage: Scalar # serialize
	}

	type PresenceMetadataSettingsIf {
		propertyNames: String
		patternProperties: Scalar
	}
`;

export async function resolver(
	_: any,
	args: PresenceQueryArgs,
	{ dataSources: { presences } }: { dataSources: { presences: Presences } }
) {
	if (!Object.keys(args).length) return presences.getAll();

	return presences.get(args);
}
