import { presenceMetadata } from "./presenceMetadataType";
import { GraphQLInt, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const presenceType = new GraphQLObjectType({
	name: "Presences",
	fields: () => ({
		url: { type: GraphQLString },
		metadata: { type: presenceMetadata },
		presenceJs: { type: GraphQLString },
		iframeJs: { type: GraphQLString },
		users: { type: GraphQLInt }
	})
});
