import { WebhookClient } from "discord.js";
import { GraphQLString } from "graphql";

import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { partnerApplyType } from "../types/partnerApply/partnerApplyType";

const coll = pmdDB.collection("applications");
const webhook = new WebhookClient({
	id: process.env.DISCORD_WEBHOOK_ID,
	token: process.env.DISCORD_WEBHOOK_TOKEN
});

export const partnerApply = {
	type: partnerApplyType,
	args: {
		partnerType: {
			name: "Partner Type",
			type: GraphQLString
		},
		partnerName: {
			name: "Partner name",
			type: GraphQLString
		},
		link: {
			name: "Partner link",
			type: GraphQLString
		},
		description: {
			name: "Partner description",
			type: GraphQLString
		},
		imageLink: {
			name: "Partner image link",
			type: GraphQLString
		},
		token: {
			name: "User token",
			type: GraphQLString
		}
	},
	resolve(
		_,
		args: {
			partnerType: string;
			partnerName: string;
			link: string;
			description: string;
			imageLink: string;
			token: string;
		}
	) {
		if (
			!args.partnerType ||
			!args.partnerName ||
			!args.link ||
			!args.description ||
			!args.imageLink ||
			!args.token
		) {
			return {
				error: 1,
				message: "Missing fields."
			};
		}

		return new Promise((resolve, reject) => {
			getDiscordUser(args.token)
				.then(async dUser => {
					if (
						await coll.findOne({
							type: "partner",
							userId: dUser.id,
							reviewed: false
						})
					) {
						return resolve({
							error: 3,
							message: "You already applied before."
						});
					}

					coll.insertOne({
						type: "partner",
						userId: dUser.id,
						reviewed: false,
						pType: args.partnerType,
						name: args.partnerName,
						link: args.link,
						description: args.description,
						imageLink: args.imageLink
					});

					webhook.send({
						embeds: [
							{
								title: `Partner Application (${args.partnerType})`,
								description: `By <@${dUser.id}>`,
								fields: [
									{
										name: "Type",
										value: args.partnerType,
										inline: false
									},
									{
										name: "Name",
										value: args.partnerName,
										inline: false
									},
									{
										name: "URL",
										value: args.link,
										inline: false
									},
									{
										name: "Description",
										value: args.description,
										inline: false
									}
								],
								thumbnail: {
									url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
								},
								image: {
									url: args.imageLink
								}
							}
						]
					});
					return resolve({
						message: "Partner application submitted"
					});
				})
				.catch(() => {
					return resolve({
						error: 2,
						message: "Invalid token."
					});
				});
		});
	}
};
