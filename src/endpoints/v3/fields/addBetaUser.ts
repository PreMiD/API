import { GraphQLString } from "graphql";

import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { addBetaUserType } from "../types/addBetaUserType/addBetaUserType";

const betaUsers = pmdDB.collection("betaUsers"),
	discordUsers = pmdDB.collection("discordUsers");

export const addBetaUser = {
	type: addBetaUserType,
	args: {
		token: {
			name: "User token",
			type: GraphQLString,
		},
	},
	resolve(_, args) {
		return new Promise((resolve, reject) => {
			getDiscordUser(args.token)
				.then(async (dUser) => {
					let maxBetaSlots = Math.floor(
						(await discordUsers.countDocuments()) * 0.1
					);
					let guildMember = await discordUsers.findOne({ userId: dUser.id });

					if (guildMember) {
						let user = await betaUsers.findOne({ userId: dUser.id }),
							betaUsersCount = await betaUsers.countDocuments();

						if (betaUsersCount < maxBetaSlots) {
							if (!user) {
								await betaUsers.insertOne({ userId: dUser.id });
								return resolve({
									success: true,
									message: "User recieved beta access.",
								});
							} else
								return resolve({
									success: false,
									message: "Our monkeys say that you are already a beta user.",
								});
						} else
							return resolve({
								success: false,
								message: "error.noslots",
							});
					} else
						return resolve({
							success: false,
							message: "User is not in the Discord server.",
						});
				})
				.catch((err) => {
					if (err)
						return resolve({
							success: false,
							message: "Invalid token provided.",
						});
				});
		});
	},
};
