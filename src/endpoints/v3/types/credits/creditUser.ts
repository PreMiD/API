import { GraphQLInt, GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

export const creditUserType = new GraphQLObjectType({
	name: "CreditUser",
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		tag: { type: GraphQLString },
		avatar: { type: GraphQLString },
		status: { type: GraphQLString },
		flags: { type: GraphQLList(GraphQLString) },
		premium_since: { type: GraphQLInt },
		role: { type: GraphQLString },
		roleId: { type: GraphQLString },
		roleColor: { type: GraphQLString },
		rolePosition: { type: GraphQLInt }
	})
});
