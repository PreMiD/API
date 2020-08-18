import { GraphQLString } from "graphql";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { downloadLinkType } from "./downloadLinkType";

export const downloadsType = new GraphQLObjectType({
	name: "Downloads",
	fields: () => ({
		releaseType: { type: GraphQLString },
		appLinks: { type: GraphQLList(GraphQLString) },
		extLinks: { type: GraphQLList(downloadLinkType) }
	})
});
