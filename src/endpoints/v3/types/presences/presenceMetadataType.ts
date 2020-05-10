import { presenceMetadataUser } from "./presenceMetadataUserType";
import { GraphQLList, GraphQLObjectType, GraphQLScalarType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const presenceMetadata = new GraphQLObjectType({
	name: "PresenceMetadata",
	fields: () => ({
		author: { type: presenceMetadataUser },
		contributors: { type: GraphQLList(presenceMetadataUser) },
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
		button: { type: GraphQLString },
		warning: { type: GraphQLString },
		settings: { type: GraphQLString }
	})
});
