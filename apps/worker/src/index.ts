import "source-map-support/register";

import * as Sentry from "@sentry/node";
import { Integrations, Transaction } from "@sentry/tracing";
import { BaseRedisCache } from "apollo-server-cache-redis";
import { InMemoryLRUCache } from "apollo-server-caching";
import {
	ApolloServerPluginCacheControl,
	ApolloServerPluginDrainHttpServer,
	ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import fastify, { FastifyContext, FastifyReply, FastifyRequest } from "fastify";
import { createClient, createCluster } from "redis";
import { MongoClient } from "mongodb";

import appUpdate from "./generic/appUpdate";
import ffUpdates from "./generic/ffUpdates";
import zippedPresences from "./generic/zippedPresences";
import fastifyAppClosePlugin from "./plugins/fastifyAppClosePlugin";
import sentryPlugin from "./plugins/sentryPlugin";
import dataSources from "./util/dataSources";
import deleteScience from "./v2/deleteScience";
import versions from "./v2/versions";
import { resolvers as v3Resolvers } from "./v3/resolvers";
import { typeDefs as v3TypeDefs } from "./v3/typeDefinition";
import { resolvers as v4Resolvers } from "./v4/resolvers";
import { typeDefs as v4TypeDefs } from "./v4/typeDefinition";

if (process.env.NODE_ENV !== "production")
	require("dotenv").config({ path: "../../../.env" });

if (process.env.SENTRY_DSN)
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		integrations: [new Integrations.Mongo()],
		sampleRate: process.env.NODE_ENV !== "production" ? 1 : 0.05,
		tracesSampleRate: process.env.NODE_ENV !== "production" ? 1 : 0.1
	});

export const mongodb = new MongoClient(process.env.MONGO_URL!, {
		appName: "PreMiD-API-Worker"
	}),
	redis = createClient({
		url: process.env.REDIS_URL || "redis://localhost:6379"
	}),
	baseRedisCache = new BaseRedisCache({
		//@ts-ignore
		client: redis
	}),
	app = fastify({
		connectionTimeout: 10_000,
		keepAliveTimeout: 10_000
	});

export let dSources: ReturnType<typeof dataSources>;

export let v3Server: ApolloServer<FastifyContext>,
	v4Server: ApolloServer<FastifyContext>;

export interface Context {
	transaction: Transaction;
}

async function run() {
	redis.setMaxListeners(12);
	redis.on("error", error => {
		console.log(error);
	});
	await redis.connect();

	dSources = dataSources();

	const apolloGenericSettings = {
		dataSources: () => dSources,
		context: (req: FastifyRequest, res: FastifyReply) => {
			Sentry.setUser({
				ip_address: req.ip
			});
			return {
				transaction: Sentry.startTransaction({
					op: "gql",
					name: "GraphQLTransaction"
				})
			};
		},
		introspection: true,
		cache: baseRedisCache,
		plugins: [
			sentryPlugin,
			fastifyAppClosePlugin(app),
			ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
			ApolloServerPluginLandingPageDisabled(),
			responseCachePlugin({ cache: new InMemoryLRUCache() }),
			ApolloServerPluginCacheControl({ defaultMaxAge: 60 })
		]
	};

	//@ts-ignore
	v3Server = new ApolloServer({
		...apolloGenericSettings,
		typeDefs: await v3TypeDefs,
		resolvers: await v3Resolvers
	});

	//@ts-ignore
	v4Server = new ApolloServer({
		...apolloGenericSettings,
		typeDefs: await v4TypeDefs,
		resolvers: await v4Resolvers
	});

	await Promise.all([mongodb.connect(), v3Server.start(), v4Server.start()]);

	app.addHook("onError", (_, _1, error, done) => {
		Sentry.captureException(error);
		done();
	});

	app.addHook("onRequest", async (req, reply) => {
		//@ts-ignore
		req.responseTimeCalc = process.hrtime();
		reply.headers({
			"X-Response-Time": process.hrtime(),
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers":
				"Origin, X-Requested-With, Content-Type, Accept"
		});
		return;
	});

	app.addHook("onSend", async (req, reply) => {
		//@ts-ignore
		const diff = process.hrtime(req.responseTimeCalc);
		reply.headers({
			"X-Response-Time": diff[0] * 1e3 + diff[1] / 1e6,
			"X-Powered-By": "PreMiD"
		});
		return reply;
	});

	app.register(v3Server.createHandler({ path: "/v3" }));
	app.register(
		v4Server.createHandler({ path: "/v4", disableHealthCheck: true })
	);

	app.get("/ping", async (req, reply) => {
		reply.status(200).send();
	});
	app.get("/v2/science/:identifier", deleteScience);
	app.get("/v2/versions", versions);
	app.get("/firefox/updates", ffUpdates);
	app.get("/app/update", appUpdate);
	app.get("/app/update/*", appUpdate);
	app.get("/presences.zip", zippedPresences);

	app
		.listen(process.env.PORT || 3001, process.env.HOST || "0.0.0.0")
		.then(url => {
			console.log(`🚀 API Listening on ${url}`);
		});
}

run();
