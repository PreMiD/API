import "source-map-support/register";

import fastify from "fastify";
import gql from "mercurius";
import middie from "middie";

import * as Sentry from "@sentry/node";

import { client, connect } from "../../db/client";
import loadEndpoints from "../functions/loadEndpoints";

export async function worker() {
	let options = {
		logger: process.env.NODE_ENV !== "production",
		disableRequestLogging: true,
		ignoreTrailingSlash: true
	};

	const server = fastify(options);

	server.addHook("onError", (_request, _reply, error, done) => {
		console.log(error);
		Sentry.captureException(error);
		done();
	});

	await Promise.all([connect(), server.register(middie)]);

	await server.register(gql, {
		schema: (await import("../../endpoints/v3/schema/schema")).default
	});

	server.addHook("onRequest", async (req, reply) => {
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

	server.options("/v3", (req, reply) => {
		reply.status(200);
		reply.send("Ok");
		return;
	});

	loadEndpoints(server, require("../../endpoints.json"));
	server.listen({ port: 3001 });

	//? Still neeeded?
	process.on("SIGINT", async function () {
		await Promise.all([client.close(), server.close()]);
		process.exit(0);
	});
}
