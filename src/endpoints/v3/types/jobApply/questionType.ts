import { GraphQLBoolean, GraphQLString } from "graphql";
import { GraphQLInputObjectType } from "graphql/type/definition";

export const questionsInputType = new GraphQLInputObjectType({
  name: "QuestionsInput",
  description: "Input for questions",
  fields: () => ({
    id: { type: GraphQLString },
    question: { type: GraphQLString },
    required: { type: GraphQLBoolean },
    label: { type: GraphQLString },
    response: { type: GraphQLString },
  }),
});
