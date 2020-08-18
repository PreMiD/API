import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const versionsType = new GraphQLObjectType({
	name: "Versions",
	fields: () => ({
		api: { type: GraphQLString },
		app: { type: GraphQLString },
		extension: { type: GraphQLString },
		bot: { type: GraphQLString },
		linux: { type: GraphQLString }
	})
});
