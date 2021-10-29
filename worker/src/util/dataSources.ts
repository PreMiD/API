import { Db } from "mongodb";

import { baseRedisCache, mongodb } from "..";
import { FFUpdates } from "../generic/ffUpdates";
import { Benefits } from "../v3/fields/benefits";
import { BetaUsers } from "../v3/fields/betaUsers";
import { Credits } from "../v3/fields/credits";
import { DiscordUsers } from "../v3/fields/discordUsers";
import { AlphaUsers, Downloads } from "../v3/fields/downloads";
import { Jobs } from "../v3/fields/jobs";
import { LangFiles } from "../v3/fields/langFiles";
import { Partners } from "../v3/fields/partners";
import Presences from "../v3/fields/presences";
import { Sponsors } from "../v3/fields/sponsors";
import { Usage } from "../v3/fields/usage";
import { Versions } from "../v3/fields/versions";

export let pmdDb: Db, dSources: ReturnType<typeof dataSources>;

export default function dataSources() {
	pmdDb = mongodb.db("PreMiD");

	const sources = {
		usage: new Usage(baseRedisCache, pmdDb.collection("science")),
		presences: new Presences(baseRedisCache, pmdDb.collection("presences")),
		versions: new Versions(baseRedisCache, pmdDb.collection("versions")),
		discordUsers: new DiscordUsers(
			baseRedisCache,
			pmdDb.collection("discordUsers")
		),
		langFiles: new LangFiles(baseRedisCache, pmdDb.collection("langFiles")),
		sponsors: new Sponsors(baseRedisCache, pmdDb.collection("sponsors")),
		partners: new Partners(baseRedisCache, pmdDb.collection("partners")),
		jobs: new Jobs(baseRedisCache, pmdDb.collection("jobs")),
		downloads: new Downloads(baseRedisCache, pmdDb.collection("downloads")),
		alphaUsers: new AlphaUsers(baseRedisCache, pmdDb.collection("alphaUsers")),
		betaUsers: new BetaUsers(baseRedisCache, pmdDb.collection("betaUsers")),
		credits: new Credits(baseRedisCache, pmdDb.collection("credits")),
		benefits: new Benefits(baseRedisCache, pmdDb.collection("benefits")),
		ffUpdates: new FFUpdates(baseRedisCache, pmdDb.collection("ffUpdates"))
	};

	dSources = sources;

	return sources;
}
