import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

export const addScienceType = new GraphQLObjectType({
  name: "addScienceType",
  fields: () => ({
    identifier: { type: GraphQLString },
    presences: { type: GraphQLList(GraphQLString) },
    os: { type: GraphQLString },
    arch: { type : GraphQLString }
  })
});