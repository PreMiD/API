import { messageType } from "./messageType";
import { GraphQLObjectType, GraphQLList } from "graphql/type/definition";
import { GraphQLString, GraphQLFloat, GraphQLInt } from "graphql";

export const ticketType = new GraphQLObjectType({
	name: "Ticket",
	fields: () => ({
		ticketId: { type: GraphQLString },
		userId: { type: GraphQLString },
		ticketMessage: { type: GraphQLString },
		timestamp: { type: GraphQLFloat },
		attachementMessage: { type: GraphQLString },
		created: { type: GraphQLFloat },
		accepter: { type: GraphQLString },
		status: { type: GraphQLInt },
		supportChannel: { type: GraphQLString },
		supportEmbed: { type: GraphQLString },
		supporters: { type: GraphQLList(GraphQLString) },
		lastUserMessage: { type: GraphQLFloat },
		messages: { type: GraphQLList(messageType) }
	})
});
