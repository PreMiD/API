import "source-map-support/register";

import cluster from "cluster";
import { cpus, hostname } from "os";

import { connect, pmdDB, rcdDB } from "../../db/client";
import initSentry from "../functions/initSentry";
import { IncomingHttpHeaders } from "node:http2";

import fs from "fs";

initSentry();

if (process.env.NODE_ENV !== "production") {
	const dotenv = require("dotenv").config;

	dotenv({ path: "../.env" });
}

export let workers: Array<cluster.Worker> = [];

export async function master() {
	await deleteOldUsers();
	setInterval(() => deleteOldUsers, 60 * 60 * 1000);

	let requests: loggedRequest[] = [],
		activeLogging = (
			await rcdDB
				.collection("projectSettings")
				.findOne({ name: "PreMiD" }, { projection: { _id: false } })
		).settings.requestLogging;

	if (!process.argv.includes("--no-cluster"))
		for (let i = 0; i < cpus().length; i++) {
			const worker = cluster.fork();

			worker.on("message", (message: any) => {
				if (message.type === "logRequest" && activeLogging)
					logRequest(requests, message.requestInfo as loggedRequest);
			});

			workers.push(worker);
		}

	setInterval(async () => {
		activeLogging = (
			await rcdDB
				.collection("projectSettings")
				.findOne({ name: "PreMiD" }, { projection: { _id: false } })
		).settings.requestLogging;

		await saveLoggedRequests(requests);

		requests = [];
	}, 5 * 60 * 1000);
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

/**
 * Log a request.
 * @param data loggedRequest
 */
export function logRequest(requests: loggedRequest[], data: loggedRequest) {
	let lR = requests.find((r: loggedRequest) => r.ip === data.ip);

	if (lR !== undefined) {
		if (!lR.paths.find((p: string) => p === data.path))
			lR.paths.push(data.path);

		if (!lR.methods.find(m => m === lR.method)) lR.methods.push(lR.method);

		lR.lastRequest = Date.now();
		lR.requests++;

		return;
	} else {
		data.paths = [data.path];
		data.requests = 1;
		data.methods = [data.method];

		return requests.push(data as loggedRequest);
	}
}

/**
 * Export logged requests to a JSON file.
 * @param loggedRequests loggedRequest[]
 */
async function saveLoggedRequests(loggedRequests: loggedRequest[]) {
	if (!fs.existsSync("../logs")) fs.mkdirSync("../logs");

	let sorted = loggedRequests
		.filter((lR: loggedRequest) => lR.requests !== undefined)
		.sort((a: loggedRequest, b: loggedRequest) => b.requests - a.requests)
		.slice(0, 50);

	await rcdDB
		.collection("logs")
		.insertOne({ logs: sorted, savedOn: Date.now(), server: hostname() })
		.then(() =>
			console.log(`[${new Date(Date.now())}] - API Requests logs saved.`)
		)
		.catch(console.log);

	return;
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
