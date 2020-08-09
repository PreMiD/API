import cluster from "cluster";
import fastifyCompress from "fastify-compress";
import connect_datadog from "connect-datadog";
import fastify from "fastify";
import gql from "fastify-gql";
//@ts-ignore
import middie from "middie";
import helmet from "fastify-helmet";
import loadEndpoints from "../functions/loadEndpoints";
import { client, connect } from "../../db/client";
import "source-map-support/register";

export async function worker() {
	await connect();
	//* Create express server
	//* Parse JSON
	//* Set API Headers
	let server = fastify({
		logger: process.env.NODE_ENV !== "production",
		ignoreTrailingSlash: true
	});
	await server.register(middie);

	if (process.env.NODE_ENV === "production") {
		const connectDatadog = connect_datadog({
			response_code: true,
			tags: [`API:${cluster.worker.id}`]
		});
		server.use(connectDatadog);
	}

	server.register(fastifyCompress);
	server.register(helmet);

	server.all("*", async (req, res) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		//* Don't hold connections open, we're an API duh
		res.header("Connection", "close");
	});
	server.register(gql, {
		schema: (await import("../../endpoints/v3/schema/schema")).default
	});
	server.post("/v3", async (req, reply) =>
		reply.graphql((req.body as any).query)
	);

	loadEndpoints(server, require("../../endpoints.json"));
	server.listen({ port: 3001, host: "0.0.0.0" });

	process.on("SIGINT", async function () {
		await Promise.all([client.close(), server.close()]);
		process.exit(0);
	});
}
