import { GraphQLList } from "graphql";

import { benefits as cache } from "../../../util/CacheManager";
import { benefitsType } from "../types/benefits/benefitsType";

export const benefits = {
	type: GraphQLList(benefitsType),
	resolve() {
		return cache.values();
	}
};
