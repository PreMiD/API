import { gql } from "apollo-server-core";

import getDiscordUser from "../../util/functions/getDiscordUser";
import { BetaUsers } from "./betaUsers";
import { DiscordUsers } from "./discordUsers";

export const schema = gql`
	type Mutation {
		addBetaUser(token: String!): AddBetaUserResult
	}

	type AddBetaUserResult {
		success: Boolean!
		message: String!
	}
`;

export async function resolver(
	_: any,
	params: { token: string },
	{
		dataSources: { discordUsers, betaUsers }
	}: {
		dataSources: {
			discordUsers: DiscordUsers;
			betaUsers: BetaUsers;
		};
	}
) {
	const res = {
		success: false,
		message: "Invalid token providen."
	};

	try {
		const user = await getDiscordUser(params.token);

		if (!(await discordUsers.get(user.id))) {
			res.message = "User is not in the Discord server.";
			return res;
		}

		if (
			(await betaUsers.countDocuments()) >
			Math.floor((await discordUsers.countDocuments()) * 1)
		) {
			res.message = "error.noslots";
			return res;
		}

		if (await betaUsers.has(user.id)) {
			res.message = "Our monkeys say that you are already a beta user.";
			return res;
		}

		await betaUsers.add(user.id);
		await betaUsers.keyv.delete(
			"findOne-" + betaUsers.getCacheKey({ userId: user.id }, undefined)
		);

		res.success = true;
		res.message = "User recieved beta access.";
		return res;
	} catch (err) {
		return res;
	}
}

export const options = {
	type: "mutation"
};
