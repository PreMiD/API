import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { cache } from "../../index";

let prs = preparePresences(cache.get("presences")),
	presenceInfos = [];

cache.on("update", (_, data) => (prs = preparePresences(data)), {
	only: "presences"
});

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const presences = prs;

	//* If presence not set
	if (!req.params["presence"])
		//* send all presences
		//* return
		return await res.send(presenceInfos);

	//* If presence "name" === versions
	if (req.params["presence"] === "versions")
		return await res.send(
			presences.map(p => {
				return {
					name: p.name,
					url: p.url,
					version: p.metadata.version
				};
			})
		);

	//* If file not set
	if (!req.params["file"]) {
		//* Find presence
		let presence = presences.find(p => p.name === req.params["presence"]);

		//* If not found
		if (!presence)
			//* Send error
			//* return
			return await res
				.status(404)
				.send({ error: 4, message: "No such presence." });

		return await res.send({
			name: presence.name,
			url: presence.url,
			metadata: presence.metadata
		});
	}

	let presence = presences.find(p => p.name === req.params["presence"]);

	//* projection disable _id
	//* switch case file
	switch (req.params["file"]) {
		case "metadata.json":
			//* Enable metadata
			//* return
			presence = { metadata: presence.metadata };
			break;
		case "presence.js":
			//* Enable presence
			//* return
			presence = presence.presenceJs;

			break;
		case "iframe.js":
			//* Enable iframe
			//* return
			presence = presence.iframeJs;

			break;
		default:
			//* send error
			//* return
			return await res.status(404).send({ error: 5, message: "No such file." });
	}

	//* If file ends with .js
	//* send response
	if (req.params["file"].endsWith(".js")) {
		//* set header JS file
		//* unescape file
		res.type("text/javascript");
		presence = unescape(<string>presence);
	}

	return await res.send(presence);
};

function preparePresences(presences) {
	return presences.map(presence => {
		if (presence.metadata.logo.includes("imgur.com"))
			presence.metadata.logo = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.logo}`;
		if (presence.metadata.thumbnail.includes("imgur.com"))
			presence.metadata.thumbnail = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.thumbnail}`;

		presenceInfos = presences.map(p => {
			return {
				name: p.name,
				url: p.url,
				metadata: p.metadata
			};
		});

		return presence;
	});
}

//* Export handler
export { handler };
