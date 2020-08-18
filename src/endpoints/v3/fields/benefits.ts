import { GraphQLList } from "graphql";

import { cache } from "../../../index";
import { benefitsType } from "../types/benefits/benefitsType";

export const benefits = {
	type: GraphQLList(benefitsType),
	resolve() {
		return cache.get("benefits");
	}
};
