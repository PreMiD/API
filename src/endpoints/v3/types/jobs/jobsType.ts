import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { questionsType } from "./questionsType";

export const jobsType = new GraphQLObjectType({
	name: "Jobs",
	fields: () => ({
		available: { type: GraphQLBoolean },
		bonusPoints: { type: GraphQLList(GraphQLString) },
		jobIcon: { type: GraphQLString },
		jobName: { type: GraphQLString },
		questions: { type: GraphQLList(questionsType) },
		requirements: { type: GraphQLList(GraphQLString) },
		tasks: { type: GraphQLList(GraphQLString) }
	})
});
