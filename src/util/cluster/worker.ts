import "source-map-support/register";
import express from "express";
import debug from "../debug";
import { connect } from "../../db/client";
import loadEndpoints from "../functions/loadEndpoints";
import bodyParser from "body-parser";
import helmet from "helmet";
import cluster from "cluster";

export async function worker() {
	await connect();

	//* Create express server
	//* Parse JSON
	//* Set API Headers
	let server = express();

	server.use(helmet());
	server.use(bodyParser.json());
	server.use((_, res, next) => {
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
	server.listen(3001);

	cluster.on("exit", worker => {
		debug("error", "index.ts", `Cluster worker ${worker.id} crashed.`);
		cluster.fork();
	});
}
