import { GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

export const changelogType = new GraphQLObjectType({
	name: "Changelog",
	fields: () => ({
		version: { type: GraphQLString },
		type: { type: GraphQLString },
		string: { type: GraphQLString },
		urls: { type: GraphQLList(GraphQLString) },
		project: { type: GraphQLString }
	})
});
