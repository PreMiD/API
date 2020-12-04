import { cache } from "../../../index";
import { betaUsersType } from "../types/betaUsers/betaUsersType";

export const betaUsers = {
	type: betaUsersType,
	resolve() {
		return { number: cache.get("betaUsers").length };
	},
};
