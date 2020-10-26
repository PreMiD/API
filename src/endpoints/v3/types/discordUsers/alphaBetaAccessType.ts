import { GraphQLBoolean } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const alphaBetaAccessType = new GraphQLObjectType({
	name: "alphaBetaAccess",
	fields: () => ({
		betaAccess: { type: GraphQLBoolean },
		alphaAccess: { type: GraphQLBoolean }
	})
});
