import { RequestHandler } from "express";
import { cache } from "../../index";

let ffUpdates = cache.get("ffUpdates");

cache.onUpdate("ffUpdates", data => (ffUpdates = data));

const handler: RequestHandler = async (_req, res) => {
	ffUpdates.map(fU => {
		delete fU._id;
	});

	res.send({
		addons: {
			"support@premid.app": {
				updates: ffUpdates
			}
		}
	});
};

export { handler };
