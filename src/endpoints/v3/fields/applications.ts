import { GraphQLList, GraphQLString } from "graphql";

import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { applicationType } from "../types/applications/applicationType";

export const applications = {
	type: GraphQLList(applicationType),
	args: {
		userId: { type: GraphQLString, defaultValue: null },
		token: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { userId?: string; token: string }) {
		return new Promise((resolve, reject) => {
			let applicationsColl = pmdDB.collection("applications");
			let creditsColl = pmdDB.collection("credits");

			if (!args.token) reject(new Error("No user token provided"));

			getDiscordUser(args.token).then(async dUser => {
				let applications = await applicationsColl.find().toArray();
				let user = await creditsColl.findOne({ userId: dUser.id });

				if (user) {
					if (user.roleIds.includes("685969048399249459")) {
						resolve(
							args.userId
								? applications.filter(a => a.userId == args.userId)
								: applications
						);
					}
				}
			});
		});
	}
};
