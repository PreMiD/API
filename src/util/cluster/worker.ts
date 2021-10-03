import "source-map-support/register";

import fastify from "fastify";
import gql from "mercurius";
import middie from "middie";

import { connect } from "../../db/client";
import { initCache } from "../CacheManager";
import loadEndpoints from "../functions/loadEndpoints";

export async function worker() {
	let options = {
		logger: process.env.NODE_ENV !== "production",
		disableRequestLogging: true,
		ignoreTrailingSlash: true
	};

	const server = fastify(options);

	server.addHook("onError", (_request, _reply, error, done) => {
		done();
	});

	await Promise.all([connect(), server.register(middie)]);

	await initCache();

	await server.register(gql, {
		path: "/v3",
		schema: (await import("../../endpoints/v3/schema/schema")).default
	});

	server.addHook("onRequest", async (req, reply) => {
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
		const diff = process.hrtime(req.responseTimeCalc);
		reply.header("X-Response-Time", diff[0] * 1e3 + diff[1] / 1e6);
		reply.header("X-Powered-By", "PreMiD");
		reply.header("Connection", "close");
		return;
	});

	loadEndpoints(server, require("../../endpoints.json"));
	server.listen({ port: 3001 });
}
