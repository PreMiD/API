import {
	GraphQLList,
	GraphQLObjectType,
	GraphQLScalarType
} from "graphql/type/definition";

import { GraphQLString } from "graphql";
import { presenceMetadataUser } from "./presenceMetadataUserType";
import { presenceSettings } from "./presenceSettingsType";

export const presenceMetadata = new GraphQLObjectType({
	name: "PresenceMetadata",
	fields: () => ({
		author: { type: presenceMetadataUser },
		contributors: { type: GraphQLList(presenceMetadataUser) },
		altnames: { type: GraphQLList(GraphQLString) },
		service: { type: GraphQLString },
		description: {
			type: new GraphQLScalarType({
				name: "PresenceMetadataDescriptionLine",
				serialize: v => v
			})
		},
		url: {
			type: new GraphQLScalarType({
				name: "ArrayOrString",
				serialize: v => v
			})
		},
		version: { type: GraphQLString },
		logo: { type: GraphQLString },
		thumbnail: { type: GraphQLString },
		color: { type: GraphQLString },
		tags: { type: GraphQLList(GraphQLString) },
		category: { type: GraphQLString },
		iframe: { type: GraphQLString },
		regExp: { type: GraphQLString },
		iframeRegExp: { type: GraphQLString },
		readLogs: { type: GraphQLString },
		button: { type: GraphQLString },
		warning: { type: GraphQLString },
		settings: { type: GraphQLList(presenceSettings) }
	})
});
