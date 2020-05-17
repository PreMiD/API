import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const sponsorType = new GraphQLObjectType({
	name: "Sponsor",
	fields: () => ({
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		image: { type: GraphQLString },
		tString: { type: GraphQLString }
	})
});
