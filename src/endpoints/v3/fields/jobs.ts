import { GraphQLList } from "graphql";

import { cache } from "../../../index";
import { jobsType } from "../types/jobs/jobsType";

export const jobs = {
	type: GraphQLList(jobsType),
	resolve() {
		return cache.get("jobs");
	}
};
