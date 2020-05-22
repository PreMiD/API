import { benefitsType } from "../types/benefits/benefitsType";
import { cache } from "../../../index";
import { GraphQLList } from "graphql";

let benefitsCache = cache.get("benefits");

cache.onUpdate("benefits", data => (benefitsCache = data));

export const benefits = {
	type: GraphQLList(benefitsType),
	resolve() {
		return benefitsCache;
	}
};
