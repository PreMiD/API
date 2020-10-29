import { GraphQLObjectType, GraphQLString } from "graphql";

export const deleteScienceType = new GraphQLObjectType({
  name: "deleteScienceType",
  fields: () => ({
    identifier: { type: GraphQLString }
  })
});