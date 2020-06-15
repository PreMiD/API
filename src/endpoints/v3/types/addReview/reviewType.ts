import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";
import { GraphQLInt, GraphQLString, GraphQLBoolean } from "graphql";

export const reviewType = new GraphQLObjectType({
	name: "reviewType",
	fields: () => ({
		userId: { type: GraphQLString },
		accepted: { type: GraphQLBoolean }
	})
});
