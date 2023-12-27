import { Db } from "mongodb";

import { mongodb, redis } from "..";
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
import { KeyvAnyRedis } from "keyv-anyredis";

export let pmdDb: Db, dSources: ReturnType<typeof dataSources>;

let store: KeyvAnyRedis;

export default function dataSources() {
	if (!store) {
		store = new KeyvAnyRedis(redis);
	}
	pmdDb = mongodb.db("PreMiD");

	const keyvDefaultOptions = {
		store: store,
		ttl: 60 * 1000
	};

	const sources = {
		usage: new Usage(pmdDb.collection("science"), {
			...keyvDefaultOptions,
			namespace: "science"
		} as any),
		presences: new Presences(pmdDb.collection("presences"), {
			...keyvDefaultOptions,
			namespace: "presences"
		} as any),
		versions: new Versions(pmdDb.collection("versions"), {
			...keyvDefaultOptions,
			namespace: "versions"
		} as any),
		discordUsers: new DiscordUsers(pmdDb.collection("discordUsers"), {
			...keyvDefaultOptions,
			namespace: "discordUsers"
		} as any),
		langFiles: new LangFiles(pmdDb.collection("langFiles"), {
			...keyvDefaultOptions,
			namespace: "langFiles"
		} as any),
		strings: new Strings(pmdDb.collection("strings"), {
			...keyvDefaultOptions,
			namespace: "strings"
		} as any),
		sponsors: new Sponsors(pmdDb.collection("sponsors"), {
			...keyvDefaultOptions,
			namespace: "sponsors"
		} as any),
		partners: new Partners(pmdDb.collection("partners"), {
			...keyvDefaultOptions,
			namespace: "partners"
		} as any),
		jobs: new Jobs(pmdDb.collection("jobs"), {
			...keyvDefaultOptions,
			namespace: "jobs"
		} as any),
		downloads: new Downloads(pmdDb.collection("downloads"), {
			...keyvDefaultOptions,
			namespace: "downloads"
		} as any),
		alphaUsers: new AlphaUsers(pmdDb.collection("alphaUsers"), {
			...keyvDefaultOptions,
			namespace: "alphaUsers"
		} as any),
		betaUsers: new BetaUsers(pmdDb.collection("betaUsers"), {
			...keyvDefaultOptions,
			namespace: "betaUsers"
		} as any),
		credits: new Credits(pmdDb.collection("credits"), {
			...keyvDefaultOptions,
			namespace: "credits"
		} as any),
		benefits: new Benefits(pmdDb.collection("benefits"), {
			...keyvDefaultOptions,
			namespace: "benefits"
		} as any),
		ffUpdates: new FFUpdates(pmdDb.collection("ffUpdates"), {
			...keyvDefaultOptions,
			namespace: "ffUpdates"
		} as any)
	};

	dSources = sources;

	return sources;
}
