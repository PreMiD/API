import "source-map-support/register";

import cluster from "cluster";
import { cpus } from "os";

import { connect, pmdDB } from "../../db/client";
import initSentry from "../functions/initSentry";

initSentry();

if (process.env.NODE_ENV !== "production") {
	const dotenv = require("dotenv").config;

	dotenv({ path: "../.env" });
}

export let workers: Array<cluster.Worker> = [];

export async function master() {
	if (!process.argv.includes("--no-cluster"))
		for (let i = 0; i < cpus().length; i++) workers.push(cluster.fork());

	await deleteOldUsers();
	setInterval(() => deleteOldUsers, 60 * 60 * 1000);
}

async function deleteOldUsers() {
	await connect();
	//* Delete older ones than 7 days
	return pmdDB.collection("science").deleteMany({
		$or: [
			{ updated: { $exists: false } },
			{ updated: { $lt: Date.now() - 31 * 24 * 60 * 60 * 1000 } }
		]
	});
}
