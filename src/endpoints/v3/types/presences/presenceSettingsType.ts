import { GraphQLString } from "graphql";
import { GraphQLObjectType, GraphQLList } from "graphql/type/definition";

//* Not sure if all of them are ok. Feel free to change them if something is wrong.
export const presenceSettings = new GraphQLObjectType({
	name: "PresenceSettings",
	fields: () => ({
		id: { type: GraphQLString },
		title: { type: GraphQLString },
		icon: { type: GraphQLString },
		if: {
			type: new GraphQLObjectType({
				name: "if",
				fields: () => ({
					propretyNames: { type: GraphQLString },
					patternProprties: { type: GraphQLString }
				})
			})
		},
		placeholder: { type: GraphQLString },
		value: { type: GraphQLString },
		values: { type: GraphQLList(GraphQLString) },
		multiLanguage: { type: GraphQLString }
	})
});
