import "source-map-support/register";
import { config } from "dotenv";
config({ path: "../.env" });
import express from "express";
import debug from "./util/debug";
import { connect } from "./db/client";
import loadEndpoints from "./util/functions/loadEndpoints";
import { fork } from "child_process";
import bodyParser from "body-parser";
import helmet from "helmet";
import cluster from "cluster";
import { cpus } from "os";

if (cluster.isMaster) {
	const cpuCount = cpus().length;
	for (let i = 0; i < cpuCount; i++) {
		cluster.fork();
	}

	if (process.env.NODE_ENV === "production") {
		//* Update response Time (StatusPage)
		setTimeout(() => fork("./util/updateResponseTime"), 5 * 1000);
		setInterval(() => fork("./util/updateResponseTime"), 5 * 60 * 1000);
	}
} else {
	//* Create express server
	//* Parse JSON
	//* Set API Headers
	let server = express();

	server.use(helmet());
	server.use(bodyParser.json());
	server.use((_req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		next();
	});

	connect()
		.then(() => {
			loadEndpoints(server, require("./endpoints.json"));
			server.listen(3001);
			debug("info", "index.ts", "Listening on port 3001");
		})
		.catch(err => debug("error", "index.ts", err.message));
}

cluster.on("exit", worker => {
	debug("error", "index.ts", `Cluster worker ${worker.id} crashed.`);
	cluster.fork();
});
