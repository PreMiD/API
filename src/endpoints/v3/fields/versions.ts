import { cache } from "../../../index";
import { versionsType } from "../types/versions/versionsType";

let versionsCache = cache.get("versions")[0];

cache.onUpdate("versions", data => (versionsCache = data[0]));

export const versions = {
	type: versionsType,
	resolve() {
		return versionsCache;
	}
};
