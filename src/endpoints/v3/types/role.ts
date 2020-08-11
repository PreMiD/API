import { GraphQLString } from "graphql";
import { GraphQLObjectType } from "graphql/type/definition";

//* Discord role Type
export const roleType = new GraphQLObjectType({
	name: "Role",
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString }
	})
});
