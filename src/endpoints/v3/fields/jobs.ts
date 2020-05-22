import { cache } from "../../../index";
import { jobsType } from "../types/jobs/jobsType";
import { GraphQLList } from "graphql";

let jobsCache = cache.get("jobs");

cache.onUpdate("jobs", data => (jobsCache = data));

export const jobs = {
	type: GraphQLList(jobsType),
	resolve() {
		return jobsCache;
	}
};
