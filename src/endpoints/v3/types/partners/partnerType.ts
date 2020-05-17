import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const partnerType = new GraphQLObjectType({
	name: "Partner",
	fields: () => ({
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		image: { type: GraphQLString },
		tString: { type: GraphQLString },
		storeName: { type: GraphQLString }
	})
});
