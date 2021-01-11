import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { safariType } from "./safariType";

export const versionsType = new GraphQLObjectType({
	name: "Versions",
	fields: () => ({
		api: { type: GraphQLString },
		app: { type: GraphQLString },
		extension: { type: GraphQLString },
		bot: { type: GraphQLString },
		linux: { type: GraphQLString },
		safari: { type: GraphQLList(safariType) }
	})
});
