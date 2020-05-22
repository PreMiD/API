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
import { versions } from "../fields/versions";
import { GraphQLObjectType, GraphQLSchema } from "graphql";

//* Root Query
const rootQuery = new GraphQLObjectType({
	name: "Root",
	fields: {
		benefits,
		credits,
		discordUsers,
		downloads,
		jobs,
		presences,
		science,
		sponsors,
		versions,
		changelog,
		partners,
		langFiles
	}
});

export default new GraphQLSchema({
	query: rootQuery
});
