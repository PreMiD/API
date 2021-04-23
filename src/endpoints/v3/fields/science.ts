import { cache } from "../../../index";
import { scienceType } from "../types/science/scienceType";

export const science = {
	type: scienceType,
	resolve() {
		return { users: cache.get("users") };
	}
};
