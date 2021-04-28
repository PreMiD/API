import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { readFileSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";

import { CacheEventHandler, versions as cache } from "../../util/CacheManager";

let versions = prepare(cache.values());

CacheEventHandler.on("versions", () => (versions = prepare(cache.values())));

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (_, res) => {
	res.header("Content-Type", "text/xml");
	res.send(versions);
};

function prepare(versions) {
	let xml = readFileSync("./endpoints/default/data/appUpdate.xml", "utf-8");
	xml = xml
		.replace("VERSIONID", versions[0].app.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", versions[0].app);

	return xml;
}

export { handler };
