import { benefitsType } from "../types/benefits/benefitsType";
import { cache } from "../../../index";
import { GraphQLList } from "graphql";

export const benefits = {
	type: GraphQLList(benefitsType),
	resolve() {
		return cache.get("benefits");
	}
};
