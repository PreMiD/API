import { creditUserType } from "./creditUser";
import { roleType } from "../role";
import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

export const creditsType = new GraphQLObjectType({
	name: "Credits",
	fields: () => ({
		user: { type: creditUserType },
		roles: {
			type: GraphQLList(roleType)
		},
		highestRole: { type: roleType }
	})
});
