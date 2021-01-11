import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const safariType = new GraphQLObjectType({
	name: "safariType",
	fields: () => ({
		version: { type: GraphQLString },
		urgent: { type: GraphQLBoolean }
	})
});
