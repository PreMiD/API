import StringOrStringArray from "../scalars/StringOrStringArray";
import { getFields } from "./typeDefinition";

export const resolvers = new Promise<any>(async r => {
	r({
		StringOrStringArray,
		Query: Object.assign(
			{},
			...(await getFields("query", "v4/fields")).map(r1 => ({
				[r1[0]]: r1[1].resolver
			}))
		),
		Mutation: Object.assign(
			{},
			...(await getFields("mutation", "v4/fields")).map(r1 => ({
				[r1[0]]: r1[1].resolver
			}))
		)
	});
});
