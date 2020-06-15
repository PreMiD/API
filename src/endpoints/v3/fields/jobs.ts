import { cache } from "../../../index";
import { jobsType } from "../types/jobs/jobsType";
import { GraphQLList } from "graphql";

export const jobs = {
	type: GraphQLList(jobsType),
	resolve() {
		return cache.get("jobs");
	}
};
