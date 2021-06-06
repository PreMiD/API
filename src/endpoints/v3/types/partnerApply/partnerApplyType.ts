import { GraphQLString, GraphQLInt } from "graphql";

import { GraphQLObjectType } from "graphql/type/definition";

export const partnerApplyType = new GraphQLObjectType({
	name: "partnerApplyType",
	fields: () => ({
		error: { type: GraphQLInt, defaultValue: null },
		message: { type: GraphQLString }
	})
});
