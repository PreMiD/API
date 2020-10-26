import { GraphQLObjectType, GraphQLSchema } from "graphql";

import { addReview } from "../fields/addReview";
import { alphaBetaAccess } from "../fields/alphaBetaAccess";
import { applications } from "../fields/applications";
import { benefits } from "../fields/benefits";
import { changelog } from "../fields/changelog";
import { credits } from "../fields/credits";
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
		alphaBetaAccess
	}
});

//* Mutaition type
const mutationType = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		addReview
	}
});

export default new GraphQLSchema({
	query: rootQuery,
	mutation: mutationType
});
