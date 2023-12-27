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
import KeyvRedis from "@keyv/redis";

export let pmdDb: Db, dSources: ReturnType<typeof dataSources>;

export default function dataSources() {
	pmdDb = mongodb.db("PreMiD");

	const keyvDefaultOptions = {
		store: new KeyvRedis(redis),
		ttl: 60 * 1000
	};

	const sources = {
		usage: new Usage(pmdDb.collection("science"), {
			...keyvDefaultOptions,
			namespace: "science"
		}),
		presences: new Presences(pmdDb.collection("presences"), {
			...keyvDefaultOptions,
			namespace: "presences"
		}),
		versions: new Versions(pmdDb.collection("versions"), {
			...keyvDefaultOptions,
			namespace: "versions"
		}),
		discordUsers: new DiscordUsers(pmdDb.collection("discordUsers"), {
			...keyvDefaultOptions,
			namespace: "discordUsers"
		}),
		langFiles: new LangFiles(pmdDb.collection("langFiles"), {
			...keyvDefaultOptions,
			namespace: "langFiles"
		}),
		strings: new Strings(pmdDb.collection("strings"), {
			...keyvDefaultOptions,
			namespace: "strings"
		}),
		sponsors: new Sponsors(pmdDb.collection("sponsors"), {
			...keyvDefaultOptions,
			namespace: "sponsors"
		}),
		partners: new Partners(pmdDb.collection("partners"), {
			...keyvDefaultOptions,
			namespace: "partners"
		}),
		jobs: new Jobs(pmdDb.collection("jobs"), {
			...keyvDefaultOptions,
			namespace: "jobs"
		}),
		downloads: new Downloads(pmdDb.collection("downloads"), {
			...keyvDefaultOptions,
			namespace: "downloads"
		}),
		alphaUsers: new AlphaUsers(pmdDb.collection("alphaUsers"), {
			...keyvDefaultOptions,
			namespace: "alphaUsers"
		}),
		betaUsers: new BetaUsers(pmdDb.collection("betaUsers"), {
			...keyvDefaultOptions,
			namespace: "betaUsers"
		}),
		credits: new Credits(pmdDb.collection("credits"), {
			...keyvDefaultOptions,
			namespace: "credits"
		}),
		benefits: new Benefits(pmdDb.collection("benefits"), {
			...keyvDefaultOptions,
			namespace: "benefits"
		}),
		ffUpdates: new FFUpdates(pmdDb.collection("ffUpdates"), {
			...keyvDefaultOptions,
			namespace: "ffUpdates"
		})
	};

	dSources = sources;

	return sources;
}
