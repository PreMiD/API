import { cache } from "../../../index";
import { sponsorType } from "../types/sponsors/sponsorType";
import { GraphQLList } from "graphql";

let sponsorsCache = cache.get("sponsors");

cache.onUpdate("sponsors", data => (sponsorsCache = data));

export const sponsors = {
	type: GraphQLList(sponsorType),
	resolve() {
		return sponsorsCache;
	}
};
