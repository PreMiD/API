import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { readFileSync } from "fs";

const versions = pmdDB.collection("versions");
const handler: RequestHandler = async (req, res) => {
	const appVersion: string = (
		await versions.findOne({}, { projection: { _id: false, app: true } })
	).app;

	let xml = readFileSync("endpoints/default/data/appUpdate.xml", "utf-8");
	xml = xml
		.replace("VERSIONID", appVersion.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", appVersion);

	res.setHeader("Content-Type", "text/xml");
	res.send(xml);
};

export { handler };
