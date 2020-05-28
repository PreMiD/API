import { questionType } from "./questionType";
import { GraphQLObjectType, GraphQLList } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const positionType = new GraphQLObjectType({
	name: "Position",
	fields: () => ({
		name: { type: GraphQLString },
		questions: { type: GraphQLList(questionType) }
	})
});
