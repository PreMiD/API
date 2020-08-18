import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const presenceMetadataUser = new GraphQLObjectType({
	name: "PresenceMetadataUser",
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString }
	})
});
