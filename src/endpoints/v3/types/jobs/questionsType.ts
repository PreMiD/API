import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const questionsType = new GraphQLObjectType({
	name: "Questions",
	fields: () => ({
		id: { type: GraphQLString },
		question: { type: GraphQLString },
		required: { type: GraphQLBoolean }
	})
});
