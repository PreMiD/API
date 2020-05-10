import { cache } from "../../../index";
import { partnerType } from "../types/partners/partnerType";
import { GraphQLList } from "graphql";

let partnersCache = cache.get("partners");

cache.onUpdate("partners", data => (partnersCache = data));

export const partners = {
	type: GraphQLList(partnerType),
	resolve() {
		return partnersCache;
	}
};
