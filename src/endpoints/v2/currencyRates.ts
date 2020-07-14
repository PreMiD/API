import { cache } from "../../index";
import { RequestHandler } from "express";

let rates = cache.get("merch");

cache.on("update", (_, data) => (rates = data), {
	only: "merch"
});

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	res.send(rates.filter(document => document.title === "rates"));
};

//* Export handler
export { handler };
