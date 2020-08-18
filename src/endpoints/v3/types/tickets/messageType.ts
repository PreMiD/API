import { GraphQLFloat, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const messageType = new GraphQLObjectType({
	name: "Message",
	fields: () => ({
		userId: { type: GraphQLString },
		content: { type: GraphQLString },
		sent: { type: GraphQLFloat }
	})
});
