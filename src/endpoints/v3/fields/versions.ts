import { versions as cache } from "../../../util/CacheManager";
import { versionsType } from "../types/versions/versionsType";

export const versions = {
	type: versionsType,
	resolve() {
		return cache.values()[0];
	}
};
