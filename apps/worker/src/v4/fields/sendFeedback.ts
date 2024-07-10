import { gql, UserInputError } from "apollo-server-core";
import validator from "validator";

import MongoDBCaching from "mongodb-caching";
import { redis } from "../..";

export const schema = gql`
	type Mutation {
		sendFeedback(
			input: String!
			type: FeedbackType!
			email: String
			discord: String
		): FeedbackResult!
	}

	enum FeedbackType {
		extension
		feature
		other
	}

	type FeedbackResult {
		success: Boolean!
	}
`;

export async function resolver(
	_: any,
	params: {
		input: string;
		type: "extension" | "feature" | "other";
		email?: string;
		discord?: string;
	},
	{
		dataSources: { feedback },
		ip
	}: { dataSources: { feedback: Feedback }; ip: string }
) {
	if (params.email && !validator.isEmail(params.email))
		return new UserInputError("email must be a valid email address.");

	//? Check ip if a feedback was already sent in the last 5 minutes
	const lastFeedback = await redis.get(`feedback:${ip}`);
	if (lastFeedback) {
		return {
			success: false
		};
	}

	try {
		await feedback.add({
			input: params.input,
			type: params.type,
			email: params.email,
			discord: params.discord
		});

		//? Set feedback sent flag for 5 minutes
		await redis.set(`feedback:${ip}`, "true", "EX", 300);

		return {
			success: true
		};
	} catch (e) {
		console.error(e);
		return {
			success: false
		};
	}
}

export const options = {
	type: "mutation"
};

interface FeedbackType {
	input: string;
	type: "extension" | "feature" | "other";
	email?: string;
	discord?: string;
}

export class Feedback extends MongoDBCaching<FeedbackType> {
	async add(feedback: FeedbackType) {
		return await this.collection.insertOne(feedback);
	}
}
