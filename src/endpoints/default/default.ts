import { RequestHandler } from "express";

const handler: RequestHandler = async (_req, res) =>
	res.redirect("//docs.premid.app");

export { handler };
