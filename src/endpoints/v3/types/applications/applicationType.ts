import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { positionType } from "./positionType";
import { reviewType } from "./reviewType";

export const applicationType = new GraphQLObjectType({
	name: "Application",
	fields: () => ({
		type: { type: GraphQLString },
		userId: { type: GraphQLString },
		reviewed: { type: GraphQLBoolean },
		position: { type: positionType },
		reviewers: { type: GraphQLList(reviewType) }
	})
});
