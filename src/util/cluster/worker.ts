import "source-map-support/register";

import fastify from "fastify";
import gql from "mercurius";
import middie from "middie";

import * as Sentry from "@sentry/node";

import { connect } from "../../db/client";
import { initCache } from "../CacheManager";
import loadEndpoints from "../functions/loadEndpoints";
import { IncomingHttpHeaders } from "node:http2";

export async function worker() {
	let options = {
		logger: process.env.NODE_ENV !== "production",
		disableRequestLogging: true,
		ignoreTrailingSlash: true
	};

	const server = fastify(options);

	server.addHook("onError", (_request, _reply, error, done) => {
		Sentry.captureException(error);
		done();
	});

	await Promise.all([connect(), server.register(middie)]);
	await initCache();

	await server.register(gql, {
		schema: (await import("../../endpoints/v3/schema/schema")).default
	});

	server.addHook("onRequest", async (req, reply) => {
		if (process.env.NODE_ENV !== "dev") {
			let requestInfo: loggedRequest = {
				ip:
					req.headers["cf-connecting-ip"] || req.ip || req.socket.remoteAddress,
				headers: req.headers,
				path: req.url,
				method: req.method
			};

			process.send({ type: "logRequest", requestInfo });
		}

		//@ts-ignore
		req.transaction = Sentry.startTransaction({
			name: req.url,
			data: req.body
		});

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

	server.addHook("onSend", async (req, reply) => {
		//@ts-ignore
		req.transaction.finish();
		//@ts-ignore
		const diff = process.hrtime(req.responseTimeCalc);
		reply.header("X-Response-Time", diff[0] * 1e3 + diff[1] / 1e6);
		reply.header("X-Powered-By", "PreMiD");
		reply.header("Connection", "close");
		return;
	});

	server.post("/v3", async (req, reply) =>
		reply.graphql((req.body as any).query)
	);

	server.options("/v3", async (req, reply) => {
		reply.status(200).send("OK");
		return;
	});

	loadEndpoints(server, require("../../endpoints.json"));
	server.listen({ port: 3001 });
}

interface loggedRequest {
	ip: string | string[];
	headers: IncomingHttpHeaders;
	path: string;
	paths?: string[];
	requests?: number;
	method: string;
	methods?: string[];
	lastRequest?: number;
}
