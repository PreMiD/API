import { cache } from "../../../index";
import { sponsorType } from "../types/sponsors/sponsorType";
import { GraphQLList } from "graphql";

export const sponsors = {
	type: GraphQLList(sponsorType),
	resolve() {
		return cache.get("sponsors");
	}
};
