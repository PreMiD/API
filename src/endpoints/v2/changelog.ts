import { RequestHandler } from "express";
import { cache } from "../../index";

let changelog = cache.get("changelog");

cache.onUpdate("changelog", data => (changelog = data));

//* Request Handler
const handler: RequestHandler = (req, res) => {
	//* project || version not set
	if (!req.params["project"] || !req.params["version"]) {
		//* send error
		//* return
		res.send({
			error: 1,
			message: `No ${!req.params["project"] ? "project" : "version"} providen.`
		});
		return;
	}

	//* Find changelog
	//* Send changelog
	res.send(
		changelog.filter(
			c =>
				c.project === req.params["project"] &&
				c.version === req.params["version"]
		)
	);
};

//* Export handler
export { handler };
