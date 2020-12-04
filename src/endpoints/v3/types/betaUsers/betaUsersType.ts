import { GraphQLInt, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const betaUsersType = new GraphQLObjectType({
	name: "betaUsersType",
	fields: () => ({
		number: { type: GraphQLInt },
	}),
});
