import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const questionType = new GraphQLObjectType({
	name: "Question",
	fields: () => ({
		id: { type: GraphQLString },
		question: { type: GraphQLString },
		required: { type: GraphQLBoolean },
		label: { type: GraphQLString },
		response: { type: GraphQLString }
	})
});
