import { gql } from "apollo-server-core";
import { shuffle } from "lodash";

import MongoDataSource from "../../classes/MongoDataSource";

export const schema = gql`
	type Query {
		credits(id: String, limit: Int, random: Boolean): [Credits]
	}

	type Credits {
		user: CreditUser
		roles: [Role]
		highestRole: Role
	}

	type CreditUser {
		id: String
		name: String
		tag: String
		avatar: String
		status: String
		flags: [String]
		premium_since: Float
		role: String
		roleId: String
		roleColor: String
		rolePosition: Int
	}

	type Role {
		id: String
		name: String
	}
`;

export class Credits extends MongoDataSource {
	async getAll() {
		return (await this.find()).map(this.transformEntry);
	}

	async get(userId: string) {
		const user = await this.findOne({ userId });

		return user ? [this.transformEntry(user)] : [];
	}

	private transformEntry(entry: any) {
		return {
			user: {
				name: entry.name,
				id: entry.userId,
				tag: entry.tag,
				avatar: entry.avatar,
				status: entry.status,
				flags: entry.flags,
				premium_since: entry.premium_since,
				role: entry.role,
				roleId: entry.roleId,
				roleColor: entry.roleColor,
				rolePosition: entry.rolePosition
			},
			highestRole: {
				id: entry.roleId,
				name: entry.role
			},
			roles: entry.roles?.map((r: any, i: number) => ({
				id: entry.roleIds[i],
				name: r
			}))
		};
	}
}

export async function resolver(
	_: any,
	params: { id?: string; limit?: number; random?: boolean },
	{ dataSources: { credits } }: { dataSources: { credits: Credits } }
) {
	if (!params.id?.trim().length) {
		let c = await credits.getAll();

		if (params.random) c = shuffle(c);

		if (params.limit) c = c.slice(0, params.limit);

		return c;
	}

	if (params.id) return credits.get(params.id);
}
