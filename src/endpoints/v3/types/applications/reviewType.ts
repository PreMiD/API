import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString, GraphQLBoolean, GraphQLFloat } from "graphql";

export const reviewType = new GraphQLObjectType({
	name: "Review",
	fields: () => ({
		userId: { type: GraphQLString },
		accepted: { type: GraphQLBoolean },
		reviewedAt: { type: GraphQLFloat }
	})
});
