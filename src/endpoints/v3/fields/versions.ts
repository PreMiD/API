import { cache } from "../../../index";
import { versionsType } from "../types/versions/versionsType";

export const versions = {
	type: versionsType,
	resolve() {
		return cache.get("versions")[0];
	}
};
