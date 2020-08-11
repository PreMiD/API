import { GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { questionType } from "./questionType";

export const positionType = new GraphQLObjectType({
	name: "Position",
	fields: () => ({
		name: { type: GraphQLString },
		questions: { type: GraphQLList(questionType) }
	})
});
