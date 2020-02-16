import { RequestHandler } from "express";
import { readFileSync } from "fs";
import { cache } from "../../index";

let versions = cache.get("versions");

cache.onUpdate("versions", data => (versions = data));

const handler: RequestHandler = async (_, res) => {
	let xml = readFileSync("endpoints/default/data/appUpdate.xml", "utf-8");
	xml = xml
		.replace("VERSIONID", versions[0].app.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", versions[0].app);

	res.setHeader("Content-Type", "text/xml");
	res.send(xml);
};

export { handler };
