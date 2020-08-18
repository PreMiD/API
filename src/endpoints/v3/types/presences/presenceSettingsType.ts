import { GraphQLString, GraphQLInt, GraphQLBoolean } from "graphql";
import {
	GraphQLObjectType,
	GraphQLList,
	GraphQLScalarType
} from "graphql/type/definition";

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
					patternProprties: {
						type: new GraphQLScalarType({
							name: "presencePatternProprtiesValue",
							serialize: v => v
						})
					}
				})
			})
		},
		placeholder: { type: GraphQLString },
		value: {
			type: new GraphQLScalarType({
				name: "presenceSettingValue",
				serialize: v => v
			})
		},
		values: {
			type: GraphQLList(
				new GraphQLScalarType({
					name: "presenceSettingValues",
					serialize: v => v
				})
			)
		},
		multiLanguage: {
			type: new GraphQLScalarType({
				name: "presenceMultiLanguage",
				serialize: v => v
			})
		}
	})
});
