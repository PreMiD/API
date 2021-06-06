import { GraphQLString, GraphQLInt } from "graphql";

import { GraphQLObjectType } from "graphql/type/definition";

export const jobApplyType = new GraphQLObjectType({
  name: "jobApplyType",
  fields: () => ({
    error: { type: GraphQLInt, defaultValue: null },
    message: { type: GraphQLString },
  }),
});
