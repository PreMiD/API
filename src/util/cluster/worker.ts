import bodyParser from "body-parser";
import cluster from "cluster";
import compression from "compression";
import connect_datadog from "connect-datadog";
import express from "express";
import graphqlHTTP from "express-graphql";
import helmet from "helmet";
import loadEndpoints from "../functions/loadEndpoints";
import { client, connect } from "../../db/client";
import { hostname } from "os";
import "source-map-support/register";

export async function worker() {
	await connect();

	//* Create express server
	//* Parse JSON
	//* Set API Headers
	let server = express();
	if (process.env.NODE_ENV === "production") {
		const connectDatadog = connect_datadog({
			response_code: true,
			tags: [`API:${cluster.worker.id}`]
		});
		server.use(connectDatadog);
	}

	server.use(compression());
	server.use(helmet());
	server.use(
		"/v3",
		graphqlHTTP({
			schema: (await import("../../endpoints/v3/schema/schema")).default,
			graphiql: true
		})
	);
	server.use(bodyParser.json());
	server.use((_, res, next) => {
		res.header("X-PreMiD-Host", hostname());
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		//* Don't hold connections open, we're an API duh
		res.setHeader("Connection", "close");

		next();
	});

	loadEndpoints(server, require("../../endpoints.json"));
	const expressServer = server.listen(3001);

	process.on("SIGINT", async function () {
		await Promise.all([client.close(), expressServer.close()]);
		process.exit(0);
	});
}
