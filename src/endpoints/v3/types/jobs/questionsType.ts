import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString, GraphQLBoolean } from "graphql";

export const questionsType = new GraphQLObjectType({
	name: "Questions",
	fields: () => ({
		id: { type: GraphQLString },
		question: { type: GraphQLString },
		required: { type: GraphQLBoolean }
	})
});
