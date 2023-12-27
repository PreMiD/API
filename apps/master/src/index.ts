import "source-map-support/register.js";

import { CronJob } from "cron";

import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/tracing";
import debug from "debug";
import { MongoClient } from "mongodb";
import { Redis } from "ioredis";

import calculatePresenceUsage from "./util/calculatePresenceUsage.js";
import updateScience from "./util/updateScience.js";
import { pEvent } from "p-event";

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
		sentinels: [
			{
				host: process.env.REDIS_HOST || "localhost",
				port: parseInt(process.env.REDIS_PORT || "26379")
			}
		],
		name: "mymaster"
	}),
	mongo = new MongoClient(process.env.MONGO_URL!, {
		appName: "PreMiD-API-Master"
	}),
	mainLog = debug("API-Master");

debug.enable("API-Master*");

mainLog("Connecting to MongoDB and Redis...");
await Promise.all([mongo.connect(), pEvent(redis, "connect")]);
mainLog("Connected!");

await Promise.all([updateScience(), calculatePresenceUsage()]);

new CronJob("* * * * *", updateScience).start();
new CronJob("* * * * *", calculatePresenceUsage).start();
