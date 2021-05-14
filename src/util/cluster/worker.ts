import "source-map-support/register";

import fastify from "fastify";
import gql from "mercurius";
import middie from "middie";

import * as Sentry from "@sentry/node";

import { connect } from "../../db/client";
import { initCache } from "../CacheManager";
import loadEndpoints from "../functions/loadEndpoints";

let requests = [];

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
		let cfip = req.headers["cf-connecting-ip"] || req.ip,
			rIp = requests.find(r => r.ip === cfip);

		if (rIp && rIp.count > 20) {
			console.log(`Request blocked: ${rIp.ip} - ${rIp.count} requests`);
			return req.socket.end();
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
		let cfip = req.headers["cf-connecting-ip"],
			rIp = requests.find(r => r.ip === cfip);

		if (rIp) rIp.count++;
		else requests.push({ ip: cfip, count: 1, path: req.url });

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

// setInterval(() => {
// 	console.log(requests.sort((a, b) => b.count - a.count).slice(0, 10));
// }, 2000);

setInterval(() => {
	// console.log(requests);
	requests = [];
}, 10 * 60 * 1000);
