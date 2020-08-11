import { GraphQLFloat, GraphQLInt, GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { messageType } from "./messageType";

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
