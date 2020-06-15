import { reviewType } from "../types/addReview/reviewType";
import { GraphQLString, GraphQLBoolean } from "graphql";
import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";

const applicationsColl = pmdDB.collection("applications");
const creditsColl = pmdDB.collection("credits");

export const addReview = {
	type: reviewType,
	args: {
		token: {
			name: "User token",
			type: GraphQLString
		},
		accepted: {
			name: "Reviewer decision",
			type: GraphQLBoolean
		},
		userId: {
			name: "UserId of applier",
			type: GraphQLString
		}
	},
	resolve(_, args) {
		return new Promise((resolve, reject) => {
			getDiscordUser(args.token)
				.then(async dUser => {
					let user = await creditsColl.findOne({ userId: dUser.id });

					if (user) {
						if (user.roleIds.includes("685969048399249459")) {
							let reviewedApplication = await applicationsColl.findOne({
								userId: args.userId,
								reviewed: false
							});
							if (reviewedApplication) {
								if (!reviewedApplication.reviewers)
									reviewedApplication.reviewers = [];

								if (
									reviewedApplication.reviewers.find(
										r => r.userId == dUser.id
									) !== undefined
								)
									return reject(
										new Error("You already reviewed this application.")
									);

								reviewedApplication.reviewers.push({
									userId: dUser.id,
									accepted: args.accepted,
									reviewedAt: Date.now()
								});

								await applicationsColl.findOneAndUpdate(
									{ userId: args.userId, reviewed: false },
									{ $set: reviewedApplication }
								);

								return resolve({
									userId: args.userId,
									accepted: args.accepted
								});
							} else return reject(new Error("Application not found"));
						} else return reject(new Error("No permissions"));
					} else return reject(new Error("User not found"));
				})
				.catch(err => {
					if (err) return reject(new Error("An error occured"));
				});
		});
	}
};
