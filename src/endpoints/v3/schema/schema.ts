import { GraphQLObjectType, GraphQLSchema } from "graphql";

import { addBetaUser } from "../fields/addBetaUser";
import { addReview } from "../fields/addReview";
import { addScience } from "../fields/addScience";
import { alphaBetaAccess } from "../fields/alphaBetaAccess";
import { applications } from "../fields/applications";
import { benefits } from "../fields/benefits";
import { betaUsers } from "../fields/betaUsers";
import { changelog } from "../fields/changelog";
import { credits } from "../fields/credits";
import { deleteScience } from "../fields/deleteScience";
import { discordUsers } from "../fields/discordUsers";
import { downloads } from "../fields/downloads";
import { jobs } from "../fields/jobs";
import { langFiles } from "../fields/langFiles";
import { partners } from "../fields/partners";
import { presences } from "../fields/presences";
import { science } from "../fields/science";
import { sponsors } from "../fields/sponsors";
import { tickets } from "../fields/tickets";
import { versions } from "../fields/versions";

//* Root Query
const rootQuery = new GraphQLObjectType({
	name: "Root",
	fields: {
		applications,
		benefits,
		betaUsers,
		changelog,
		credits,
		discordUsers,
		downloads,
		jobs,
		langFiles,
		partners,
		presences,
		science,
		sponsors,
		tickets,
		versions,
		alphaBetaAccess,
	},
});

//* Mutation type
const mutationType = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		addBetaUser,
		addReview,
		addScience,
		deleteScience,
	},
});

export default new GraphQLSchema({
	query: rootQuery,
	mutation: mutationType,
});
