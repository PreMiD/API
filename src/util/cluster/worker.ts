import "source-map-support/register";

import fastify from "fastify";
import gql from "fastify-gql";
import helmet from "fastify-helmet";
import middie from "middie";

import { client, connect } from "../../db/client";
import loadEndpoints from "../functions/loadEndpoints";

export async function worker() {
	const server = fastify({
		logger: process.env.NODE_ENV !== "production",
		ignoreTrailingSlash: true
	});

	await Promise.all([
		connect(),
		server.register(middie),
		server.register(helmet)
	]);

	await server.register(gql, {
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
