import { ticketType } from "../types/tickets/ticketType";
import { GraphQLList, GraphQLString } from "graphql";
import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";

export const tickets = {
	type: GraphQLList(ticketType),
	args: {
		userId: { type: GraphQLString, defaultValue: null },
		token: { type: GraphQLString, defaultValue: null }
	},
	resolve(_, args: { userId?: string; token: string }) {
		return new Promise((resolve, reject) => {
			let ticketsColl = pmdDB.collection("tickets");
			let creditsColl = pmdDB.collection("credits");

			if (!args.token) reject(new Error("No user token provided"));

			getDiscordUser(args.token).then(async dUser => {
				let tickets = await ticketsColl.find().toArray();
				let user = await creditsColl.findOne({ userId: dUser.id });

				if (user) {
					if (user.roleIds.includes("685969048399249459")) {
						resolve(
							args.userId
								? tickets.filter(a => a.userId == args.userId)
								: tickets
						);
					}
				}
			});
		});
	}
};
