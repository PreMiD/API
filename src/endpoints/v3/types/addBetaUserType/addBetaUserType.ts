import { GraphQLBoolean, GraphQLString } from "graphql";

import { GraphQLObjectType } from "graphql/type/definition";

export const addBetaUserType = new GraphQLObjectType({
	name: "addBetaUserType",
	fields: () => ({
		success: { type: GraphQLBoolean },
		message: { type: GraphQLString },
	}),
});
