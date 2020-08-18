import { GraphQLBoolean, GraphQLFloat, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const reviewType = new GraphQLObjectType({
	name: "Review",
	fields: () => ({
		userId: { type: GraphQLString },
		accepted: { type: GraphQLBoolean },
		reviewedAt: { type: GraphQLFloat }
	})
});
