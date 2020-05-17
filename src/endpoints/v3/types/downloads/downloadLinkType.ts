import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const downloadLinkType = new GraphQLObjectType({
	name: "DownloadLink",
	fields: () => ({
		platform: { type: GraphQLString },
		link: { type: GraphQLString }
	})
});
