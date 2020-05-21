import { cache } from "../../index";
import { RequestHandler } from "express";

let ffUpdates = cache.get("ffUpdates");

cache.onUpdate("ffUpdates", data => (ffUpdates = data));

const handler: RequestHandler = async (_req, res) => {
	res.send({
		addons: {
			"support@premid.app": {
				updates: ffUpdates
			}
		}
	});
};

export { handler };
