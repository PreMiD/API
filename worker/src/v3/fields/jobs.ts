import { gql } from "apollo-server-core";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		jobs: [Job]
	}

	type Job {
		available: Boolean
		bonusPoints: [String]
		jobIcon: String
		jobName: String
		questions: [JobQuestion]
		requirements: [String]
		tasks: [String]
	}

	type JobQuestion {
		id: String
		question: String
		required: Boolean
	}
`;

export class Jobs extends MongoDataSource {
	getAll() {
		return this.find();
	}
}

export function resolver(
	_: any,
	_1: any,
	{ dataSources: { jobs } }: { dataSources: { jobs: Jobs } }
) {
	return jobs.getAll();
}
