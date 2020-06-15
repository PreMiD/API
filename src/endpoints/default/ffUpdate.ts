import { cache } from "../../index";
import { RequestHandler } from "express";

const handler: RequestHandler = async (_req, res) => {
	res.send({
		addons: {
			"support@premid.app": {
				updates: cache.get("ffUpdates")
			}
		}
	});
};

export { handler };
