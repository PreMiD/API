import { GraphQLString } from "graphql";
import { GraphQLObjectType, GraphQLScalarType } from "graphql/type/definition";

export const langFileType = new GraphQLObjectType({
	name: "LangFile",
	fields: () => ({
		lang: { type: GraphQLString },
		project: { type: GraphQLString },
		translations: {
			type: new GraphQLScalarType({
				name: "Translations",
				serialize(t) {
					return t;
				}
			})
		}
	})
});
