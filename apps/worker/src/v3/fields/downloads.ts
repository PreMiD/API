import { gql } from "apollo-server-core";
import MongoDBCaching from "mongodb-caching";

import getDiscordUser from "../../util/functions/getDiscordUser";
import { BetaUsers } from "./betaUsers";

export const schema = gql`
	type Query {
		downloads(releaseType: String, token: String): [Download]
	}

	type Download {
		releaseType: String!
		enabled: Boolean!
		appLinks: [String!]!
		extLinks: [DownloadLink!]!
	}

	type DownloadLink {
		platform: String!
		link: String!
	}
`;

export class Downloads extends MongoDBCaching {
	async getAll(
		params: { releaseType?: string; token?: string },
		alphaUsers: AlphaUsers,
		betaUsers: BetaUsers
	) {
		if (!params?.token) return [];

		try {
			const { id } = await getDiscordUser(params.token);

			const accessTypes = await Promise.all([
				alphaUsers.has(id),
				betaUsers.has(id)
			]);

			if (!accessTypes[0] && !accessTypes[1]) return [];

			const query: { item?: string } = {};

			if (!accessTypes[0] && accessTypes[1]) query.item = "beta";

			const res = await this.find(query);

			return res.map(r => ({
				releaseType: r.item,
				enabled: r.enabled,
				appLinks: r.app_links,
				extLinks: r.ext_links
			}));
		} catch (err) {
			return [];
		}
	}
}

export class AlphaUsers extends MongoDBCaching {
	async has(userId: string) {
		return (await this.findOne({ userId })) !== null;
	}
}

export function resolver(
	_: any,
	params: { releaseType?: string; token?: string },
	{
		dataSources: { downloads, alphaUsers, betaUsers }
	}: {
		dataSources: {
			downloads: Downloads;
			alphaUsers: AlphaUsers;
			betaUsers: BetaUsers;
		};
	}
) {
	return downloads.getAll(params, alphaUsers, betaUsers);
}
