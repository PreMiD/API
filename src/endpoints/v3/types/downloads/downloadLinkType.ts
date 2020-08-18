import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

export const downloadLinkType = new GraphQLObjectType({
	name: "DownloadLink",
	fields: () => ({
		platform: { type: GraphQLString },
		link: { type: GraphQLString }
	})
});
