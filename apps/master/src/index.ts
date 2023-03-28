import "source-map-support/register";

import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/tracing";
import debug from "debug";
import { MongoClient } from "mongodb";
import { createClient } from "redis";

import calculatePresenceUsage from "./util/calculatePresenceUsage";
import updateScience from "./util/updateScience";

if (process.env.NODE_ENV !== "production")
	require("dotenv").config({ path: "../../.env" });

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	enabled: process.env.NODE_ENV === "production",
	environment: process.env.NODE_ENV,
	integrations: [new Integrations.Mongo()]
});

export const redis = createClient({
		url: process.env.REDIS_URL || "localhost:6379"
	}),
	mongo = new MongoClient(process.env.MONGO_URL!, {
		appName: "PreMiD-API-Master"
	}),
	mainLog = debug("API-Master");

redis.on("error", err => console.log(err.message));

async function run() {
	debug.enable("API-Master*");

	await Promise.all([mongo.connect(), redis.connect()]);

	mainLog("Running");

	await Promise.all([updateScience(), calculatePresenceUsage()]);

	setInterval(() => {
		updateScience();
		calculatePresenceUsage();
	}, 60 * 1000);
}

run();
