import { GraphQLString } from "graphql";
import { GraphQLList } from "graphql/type/definition";

import { cache } from "../../../index";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { downloadsType } from "../types/downloads/downloadsType";

let downloadsCache = prepareDownloads(cache.get("downloads"));

cache.on("update", (_, data) => (downloadsCache = prepareDownloads(data)), {
	only: "downloads"
});

export const downloads = {
	type: GraphQLList(downloadsType),
	args: {
		releaseType: { type: GraphQLString, defaultValue: null },
		token: { type: GraphQLString, defaultValue: null }
	},
	async resolve(_, args) {
		if (args.token) {
			try {
				const dUser = await getDiscordUser(args.token),
					accessType = cache
						.get("alphaUsers")
						.find(aU => aU.userId === dUser.id)
						? "alpha"
						: cache.get("betaUsers").find(aU => aU.userId === dUser.id)
						? "beta"
						: false;

				if (accessType === "alpha") return downloadsCache;
				else if (accessType === "beta")
					return [downloadsCache.find(c => c.releaseType === "beta")];
				else return [];
			} catch (e) {
				return [];
			}
		} else return [];
	}
};

function prepareDownloads(downloads) {
	return downloads.map(c => ({
		releaseType: c.item,
		enabled: c.enabled,
		appLinks: c.app_links,
		extLinks: c.ext_links
	}));
}
