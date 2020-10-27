import { GraphQLBoolean, GraphQLString } from "graphql";

import { GraphQLObjectType } from "graphql/type/definition";

export const reviewType = new GraphQLObjectType({
	name: "reviewType",
	fields: () => ({
		userId: { type: GraphQLString },
		accepted: { type: GraphQLBoolean }
	})
});
