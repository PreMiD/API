import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const partnerType = new GraphQLObjectType({
	name: "Partner",
	fields: () => ({
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		image: { type: GraphQLString },
		tString: { type: GraphQLString },
		storeName: { type: GraphQLString },
		url: { type: GraphQLString }
	})
});
