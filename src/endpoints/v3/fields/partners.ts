import { GraphQLList } from "graphql";

import { partners as cache } from "../../../util/CacheManager";
import { partnerType } from "../types/partners/partnerType";

export const partners = {
	type: GraphQLList(partnerType),
	resolve() {
		return cache.values();
	}
};
