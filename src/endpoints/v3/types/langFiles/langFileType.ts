import { GraphQLObjectType, GraphQLScalarType } from "graphql/type/definition";
import { GraphQLString } from "graphql";

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
