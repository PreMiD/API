import "source-map-support/register.js";

import { CronJob } from "cron";

import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/tracing";
import debug from "debug";
import { MongoClient } from "mongodb";
import { Redis } from "ioredis";

import calculatePresenceUsage from "./util/calculatePresenceUsage.js";
import updateScience from "./util/updateScience.js";
import updateHeartbeats from "./util/updateHeartbeats.js";

if (process.env.NODE_ENV !== "production")
	(await import("dotenv")).config({ path: "../../../.env" });

if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not defined!");

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	enabled: process.env.NODE_ENV === "production",
	environment: process.env.NODE_ENV,
	integrations: [new Integrations.Mongo()]
});

export const redis = new Redis({
		sentinels: process.env.REDIS_SENTINELS?.split(",")?.map(s => ({
			host: s,
			port: 26379
		})),
		name: "mymaster",
		lazyConnect: true
	}),
	mongo = new MongoClient(process.env.MONGO_URL!, {
		appName: "PreMiD-API-Master"
	}),
	mainLog = debug("API-Master");

debug.enable("API-Master*");

mainLog("Connecting to MongoDB...");
await mongo.connect();
mainLog("Connecting to Redis...");
await redis.connect();
mainLog("Connected!");

await Promise.all([
	updateScience(),
	calculatePresenceUsage(),
	updateHeartbeats()
]);

new CronJob("* * * * *", updateScience).start();
new CronJob("* * * * *", calculatePresenceUsage).start();
new CronJob("*/1 * * * * *", updateHeartbeats).start();
