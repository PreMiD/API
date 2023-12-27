import "source-map-support/register.js";

import { CronJob } from "cron";

import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/tracing";
import debug from "debug";
import { MongoClient } from "mongodb";
import { createClient } from "redis";

import calculatePresenceUsage from "./util/calculatePresenceUsage.js";
import updateScience from "./util/updateScience.js";

if (process.env.NODE_ENV !== "production")
	(await import("dotenv")).config({ path: "../../../.env" });

if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not defined!");

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	enabled: process.env.NODE_ENV === "production",
	environment: process.env.NODE_ENV,
	integrations: [new Integrations.Mongo()]
});

export const redis = createClient({
		url: process.env.REDIS_URL || "redis://localhost:6379/"
	}),
	mongo = new MongoClient(process.env.MONGO_URL!, {
		appName: "PreMiD-API-Master"
	}),
	mainLog = debug("API-Master");

redis.on("error", err => {
	throw err;
});

debug.enable("API-Master*");

mainLog("Connecting to MongoDB...");
await mongo.connect();
mainLog("Connecting to Redis...");
await redis.connect();

mainLog("Connected!");

await Promise.all([updateScience(), calculatePresenceUsage()]);

new CronJob("* * * * *", updateScience).start();
new CronJob("* * * * *", calculatePresenceUsage).start();
