import { GraphQLObjectType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

//* Discord role Type
export const roleType = new GraphQLObjectType({
	name: "Role",
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString }
	})
});
