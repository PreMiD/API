import { GraphQLList } from "graphql";

import { jobs as cache } from "../../../util/CacheManager";
import { jobsType } from "../types/jobs/jobsType";

export const jobs = {
	type: GraphQLList(jobsType),
	resolve() {
		return cache.values();
	}
};
