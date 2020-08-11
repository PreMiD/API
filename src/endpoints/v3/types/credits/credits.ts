import { GraphQLList, GraphQLObjectType } from "graphql/type/definition";

import { roleType } from "../role";
import { creditUserType } from "./creditUser";

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
