import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const benefitsType = new GraphQLObjectType({
	name: "Benefits",
	fields: () => ({
		description: { type: GraphQLString },
		icon: { type: GraphQLString },
		title: { type: GraphQLString }
	})
});
