import { RequestHandler } from "express";
import { cache } from "../../index";

let ffUpdates = cache.get("ffUpdates");

cache.onUpdate("ffUpdates", data => (ffUpdates = data));

const handler: RequestHandler = (_req, res) => {
	res.send({
		addons: {
			"support@premid.app": {
				updates: ffUpdates
			}
		}
	});
};

export { handler };
