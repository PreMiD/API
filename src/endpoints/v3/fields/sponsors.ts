import { GraphQLList } from "graphql";

import { sponsors as cache } from "../../../util/CacheManager";
import { sponsorType } from "../types/sponsors/sponsorType";

export const sponsors = {
	type: GraphQLList(sponsorType),
	resolve() {
		return cache.values();
	}
};
