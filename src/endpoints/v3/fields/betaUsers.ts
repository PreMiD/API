import { betaUsers as cache } from "../../../util/CacheManager";
import { betaUsersType } from "../types/betaUsers/betaUsersType";

export const betaUsers = {
	type: betaUsersType,
	resolve() {
		return { number: cache.length };
	}
};
