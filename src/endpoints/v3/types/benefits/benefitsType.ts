import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const benefitsType = new GraphQLObjectType({
	name: "Benefits",
	fields: () => ({
		description: { type: GraphQLString },
		icon: { type: GraphQLString },
		title: { type: GraphQLString }
	})
});
