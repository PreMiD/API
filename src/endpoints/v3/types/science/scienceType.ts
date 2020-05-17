import { GraphQLInt } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const scienceType = new GraphQLObjectType({
	name: "Science",
	fields: () => ({
		users: { type: GraphQLInt }
	})
});
