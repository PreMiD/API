import { gql } from "apollo-server-core";

import { BetaUsers } from "./betaUsers";
import { AlphaUsers } from "./downloads";

export const schema = gql`
	type Query {
		alphaBetaAccess(userId: String): AlphaBetaAccess
	}

	type AlphaBetaAccess {
		alphaAccess: Boolean!
		betaAccess: Boolean!
	}
`;

export async function resolver(
	_: any,
	params: { userId?: string },
	{
		dataSources: { alphaUsers, betaUsers }
	}: {
		dataSources: {
			alphaUsers: AlphaUsers;
			betaUsers: BetaUsers;
		};
	}
) {
	const res = { alphaAccess: false, betaAccess: false };

	if (!params.userId?.trim().length) return res;

	const accessTypes = await Promise.all([
		alphaUsers.has(params.userId),
		betaUsers.has(params.userId)
	]);

	res.alphaAccess = accessTypes[0];
	res.betaAccess = accessTypes[1];

	return res;
}
