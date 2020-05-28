import { reviewType } from "./reviewType";
import { positionType } from "./positionType";
import { GraphQLObjectType, GraphQLList } from "graphql/type/definition";
import { GraphQLString, GraphQLBoolean } from "graphql";

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
