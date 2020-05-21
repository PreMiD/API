import { cache } from "../../index";
import { readFileSync } from "fs";
import { RequestHandler } from "express";

let versions = prepare(cache.get("versions"));

cache.onUpdate("versions", data => (versions = prepare(data)));

const handler: RequestHandler = async (_, res) => {
	res.setHeader("Content-Type", "text/xml");
	res.send(versions);
};

function prepare(versions) {
	let xml = readFileSync("endpoints/default/data/appUpdate.xml", "utf-8");
	xml = xml
		.replace("VERSIONID", versions[0].app.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", versions[0].app);

	return xml;
}

export { handler };
