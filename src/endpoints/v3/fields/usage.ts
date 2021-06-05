import { users as cache } from "../../../util/CacheManager";
import { usageType } from "../types/usage/usageType";

export const usage = {
	type: usageType,
	resolve() {
		return {count: cache};
	}
};
