import { cache } from "../../index";
import { RequestHandler } from "express";

let prs = preparePresences(cache.get("presences"));

cache.onUpdate("presences", data => (prs = preparePresences(data)));

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	const presences = prs;

	//* If presence not set
	if (!req.params["presence"]) {
		//* send all presences
		//* return
		res.send(
			presences.map(p => {
				return {
					name: p.name,
					url: p.url,
					metadata: p.metadata
				};
			})
		);
		return;
	}

	//* If presence "name" === versions
	if (req.params["presence"] === "versions") {
		res.send(
			presences.map(p => {
				return {
					name: p.name,
					url: p.url,
					version: p.metadata.version
				};
			})
		);
		return;
	}

	//* If file not set
	if (!req.params["file"]) {
		//* Find presence
		let presence = presences.find(p => p.name === req.params["presence"]);

		//* If not found
		if (!presence) {
			//* Send error
			//* return
			res.send({ error: 4, message: "No such presence." });
			return;
		}

		res.send({
			name: presence.name,
			url: presence.url,
			metadata: presence.metadata
		});
		return;
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
			res.send({ error: 5, message: "No such file." });
			return;
	}

	//* If file ends with .js
	//* send response
	if (req.params["file"].endsWith(".js")) {
		//* set header JS file
		//* unescape file
		res.setHeader("content-type", "text/javascript");
		presence = unescape(<string>presence);
	}

	res.send(presence);
};

function preparePresences(presences) {
	return presences.map(presence => {
		if (presence.metadata.logo.includes("imgur.com"))
			presence.metadata.logo = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.logo}`;
		if (presence.metadata.thumbnail.includes("imgur.com"))
			presence.metadata.thumbnail = `https://proxy.duckduckgo.com/iu/?u=${presence.metadata.thumbnail}`;

		return presence;
	});
}

//* Export handler
export { handler };
