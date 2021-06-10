import { GraphQLList, GraphQLString } from "graphql";

import { addScienceType } from "../types/science/addScienceType";
import { pmdDB } from "../../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");
let scienceUpdateQueue: Array<{
		identifier?: string;
		presences?: string[];
		platform?: { os?: string; arch?: string };
	}> = [],
	updateInterval = 60 * 1000;

setInterval(() => {
	const scienceToUpdate = scienceUpdateQueue;
	scienceUpdateQueue = [];

	if (scienceToUpdate.length === 0) return;

	science.bulkWrite(
		scienceToUpdate.map(s => {
			return {
				updateOne: {
					filter: { identifier: s.identifier },
					update: { $set: s },
					upsert: true
				}
			};
		})
	);
}, updateInterval);

export const addScience = {
	type: addScienceType,
	args: {
		identifier: {
			name: "identifier",
			type: GraphQLString
		},
		presences: {
			name: "List of presences user has installed",
			type: GraphQLList(GraphQLString)
		},
		os: {
			name: "Operating Software of user",
			type: GraphQLString
		},
		arch: {
			name: "Arch of user",
			type: GraphQLString
		}
	},
	resolve(_, args) {
		let data: any = {
			identifier: args.identifier,
			presences: args.presences,
			platform: {
				os: args.os,
				arch: args.arch
			},
			updated: Date.now()
		};
		scienceUpdateQueue.push(data);

		return {
			identifier: data.identifier,
			presences: data.presences,
			os: data.platform.os,
			arch: data.platform.arch
		};
	}
};
