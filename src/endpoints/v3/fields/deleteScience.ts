import { GraphQLString } from "graphql";
import { deleteScienceType } from "../types/science/deleteScienceType";
import { pmdDB } from "../../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

export const deleteScience = {
	type: deleteScienceType,
	args: {
		identifier: {
			name: "identifier",
			type: GraphQLString
		}
	},
	resolve(_, args) {
    science.findOneAndDelete({ identifier: args.identifier });
    return { identifier: args.identifier };
	}
};