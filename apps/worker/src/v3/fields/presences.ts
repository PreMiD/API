import { gql, UserInputError } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

import { redis } from "../..";

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
		iframeRegExp: String
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
		# Smh for that type, blame TheDrop.
		propretyNames: String
		patternProprties: Scalar
	}
`;

export default class Presences extends MongoDBCaching {
	async getAll() {
		return this.preparePresences(await this.find());
	}

	async get(args: PresenceQueryArgs) {
		let query: any = {};

		if (args.service)
			query["metadata.service"] = Array.isArray(args.service)
				? { $in: args.service.map(s => s.trim()) }
				: args.service.trim();

		if (args.author?.trim()) query["metadata.author.id"] = args.author.trim();

		if (args.contributor?.trim())
			query["metadata.contributors.id"] = args.contributor.trim();

		if (args.query?.trim()) {
			if (args.query.trim().length < 3)
				throw new UserInputError("Query must be at least 3 characters long.");

			query["metadata.service"] = new RegExp(args.query.trim(), "i");
		}

		if (args.tag?.trim()) query["metadata.tags"] = args.tag.trim();

		let options: any = { ttl: 60 };

		if (args.limit)
			options.findOptions = { limit: args.limit, skip: args.start || 0 };

		return this.preparePresences(await this.find(query, options));
	}

	async preparePresences(presences: any[]) {
		let usage: any;

		try {
			usage = JSON.parse((await redis.get("pmd-api.presence-usage")) || "");
		} catch (err) {}

		presences.forEach(p => {
			p.users = usage ? usage[p.metadata.service] || 0 : 0;
		});

		return presences;
	}
}

export function resolver(
	_: any,
	args: PresenceQueryArgs,
	{ dataSources: { presences } }: { dataSources: { presences: Presences } }
) {
	if (!Object.keys(args).length) return presences.getAll();

	return presences.get(args);
}
