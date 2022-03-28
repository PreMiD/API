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
import { Strings } from "../v4/fields/strings";

export let pmdDb: Db, dSources: ReturnType<typeof dataSources>;

export default function dataSources() {
	pmdDb = mongodb.db("PreMiD");

	const sources = {
		usage: new Usage(pmdDb.collection("science"), baseRedisCache),
		presences: new Presences(pmdDb.collection("presences"), baseRedisCache),
		versions: new Versions(pmdDb.collection("versions"), baseRedisCache),
		discordUsers: new DiscordUsers(
			pmdDb.collection("discordUsers"),
			baseRedisCache
		),
		langFiles: new LangFiles(pmdDb.collection("langFiles"), baseRedisCache),
		strings: new Strings(pmdDb.collection("langFiles"), baseRedisCache),
		sponsors: new Sponsors(pmdDb.collection("sponsors"), baseRedisCache),
		partners: new Partners(pmdDb.collection("partners"), baseRedisCache),
		jobs: new Jobs(pmdDb.collection("jobs"), baseRedisCache),
		downloads: new Downloads(pmdDb.collection("downloads"), baseRedisCache),
		alphaUsers: new AlphaUsers(pmdDb.collection("alphaUsers"), baseRedisCache),
		betaUsers: new BetaUsers(pmdDb.collection("betaUsers"), baseRedisCache),
		credits: new Credits(pmdDb.collection("credits"), baseRedisCache),
		benefits: new Benefits(pmdDb.collection("benefits"), baseRedisCache),
		ffUpdates: new FFUpdates(pmdDb.collection("ffUpdates"), baseRedisCache)
	};

	dSources = sources;

	return sources;
}
