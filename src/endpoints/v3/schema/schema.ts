import { credits } from "../fields/credits";
import { downloads } from "../fields/downloads";
import { presences } from "../fields/presences";
import { GraphQLObjectType,  GraphQLSchema,   } from "graphql";

//* Root Query
const rootQuery = new GraphQLObjectType({
	name: "Root",
	fields: {
		credits,
		downloads,
		presences
	}
});

export default new GraphQLSchema({
	query: rootQuery
});
