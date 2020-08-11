import { GraphQLFloat, GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const discordUserType = new GraphQLObjectType({
	name: "DiscordUser",
	fields: () => ({
		avatar: { type: GraphQLString },
		created: { type: GraphQLFloat },
		userId: { type: GraphQLString },
		username: { type: GraphQLString },
		discriminator: { type: GraphQLString }
	})
});
