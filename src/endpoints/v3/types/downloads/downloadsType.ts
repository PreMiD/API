import { downloadLinkType } from "./downloadLinkType";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

export const downloadsType = new GraphQLObjectType({
	name: "Downloads",
	fields: () => ({
		releaseType: { type: GraphQLString },
		appLinks: { type: GraphQLList(GraphQLString) },
		extLinks: { type: GraphQLList(downloadLinkType) }
	})
});
