import { cache } from "../../../index";
import { downloadsType } from "../types/downloads/downloadsType";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { GraphQLList } from "graphql/type/definition";
import { GraphQLString } from "graphql";

let downloadsCache = prepareDownloads(cache.get("downloads"));

cache.on("update", (_, data) => (downloadsCache = prepareDownloads(data)), {
	only: "downloads"
});

export const downloads = {
	type: GraphQLList(downloadsType),
	args: {
		releaseType: { type: GraphQLString, defaultValue: null }
	},
	async resolve(_, _1, context) {
		if (context.query?.token) {
			try {
				const dUser = await getDiscordUser(context.query.token),
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
		appLinks: c.app_links,
		extLinks: c.ext_links
	}));
}
