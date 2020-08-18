import { GraphQLList } from "graphql";

import { cache } from "../../../index";
import { sponsorType } from "../types/sponsors/sponsorType";

export const sponsors = {
	type: GraphQLList(sponsorType),
	resolve() {
		return cache.get("sponsors");
	}
};
