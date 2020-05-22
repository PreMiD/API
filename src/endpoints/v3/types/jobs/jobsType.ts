import { questionsType } from "./questionsType";
import { GraphQLObjectType, GraphQLList } from "graphql/type/definition";
import { GraphQLString, GraphQLBoolean } from "graphql";

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
