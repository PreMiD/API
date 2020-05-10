import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const presenceMetadataUser = new GraphQLObjectType({
	name: "PresenceMetadataUser",
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString }
	})
});
