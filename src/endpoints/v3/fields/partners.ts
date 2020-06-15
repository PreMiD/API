import { cache } from "../../../index";
import { partnerType } from "../types/partners/partnerType";
import { GraphQLList } from "graphql";

export const partners = {
	type: GraphQLList(partnerType),
	resolve() {
		return cache.get("partners");
	}
};
