import { GraphQLList } from "graphql";

import { cache } from "../../../index";
import { partnerType } from "../types/partners/partnerType";

export const partners = {
	type: GraphQLList(partnerType),
	resolve() {
		return cache.get("partners");
	}
};
