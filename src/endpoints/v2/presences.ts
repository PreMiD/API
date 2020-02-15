import { RequestHandler } from "express";
import { cache } from "../../index";

let presences = cache.get("presences"),
	lastCacheUpdate = Date.now() + 300000;

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (lastCacheUpdate <= Date.now()) {
		lastCacheUpdate = Date.now() + 300000;
		presences = cache.get("presences");
	}

	//* If presence not set
	if (!req.params["presence"]) {
		//* send all presences
		//* return
		res.send(
			presences
				.map(p => {
					delete p._id;
					delete p.presenceJs;
					delete p.iframeJs;
					return p;
				})
				.map(presence => {
					return imgurReplacer(presence);
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

		presence = {
			name: presence.name,
			url: presence.url,
			metadata: presence.metadata
		};

		res.send(imgurReplacer(presence));
		return;
	}

	let presence = presences.find(p => p.name === req.params["presence"]);

	//* projection disable _id
	//* switch case file
	switch (req.params["file"]) {
		case "metadata.json":
			//* Enable metadata
			//* return
			presence = imgurReplacer({ metadata: presence.metadata }).metadata;
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

function imgurReplacer(presence) {
	if (presence.metadata.logo.includes("imgur.com"))
		presence.metadata.logo =
			"https://proxy.duckduckgo.com/iu/?u=" + presence.metadata.logo;
	if (presence.metadata.thumbnail.includes("imgur.com"))
		presence.metadata.thumbnail =
			"https://proxy.duckduckgo.com/iu/?u=" + presence.metadata.thumbnail;

	return presence;
}

//* Export handler
export { handler };
