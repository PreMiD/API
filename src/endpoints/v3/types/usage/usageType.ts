import { GraphQLInt } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const usageType = new GraphQLObjectType({
	name: "Usage",
	fields: () => ({
		count: { type: GraphQLInt }
	})
});
