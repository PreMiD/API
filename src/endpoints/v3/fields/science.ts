import { users } from "../../../util/CacheManager";
import { scienceType } from "../types/science/scienceType";

export const science = {
	type: scienceType,
	resolve() {
		return { users };
	}
};
