import { cache } from "../../../index";
import { scienceType } from "../types/science/scienceType";

let users = cache.get("science").length;

cache.onUpdate("science", data => (users = data.length));

export const science = {
	type: scienceType,
	resolve() {
		return { users: users };
	}
};
