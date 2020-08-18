import { GraphQLInt, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

import { presenceMetadata } from "./presenceMetadataType";

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
