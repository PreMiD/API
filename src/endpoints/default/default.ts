import { RequestHandler } from "express";

const handler: RequestHandler = (_req, res) =>
	res.redirect("//docs.premid.app");

export { handler };
