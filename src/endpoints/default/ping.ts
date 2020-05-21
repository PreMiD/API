import { RequestHandler } from "express";

const handler: RequestHandler = async (_req, res) => res.sendStatus(200);

export { handler };
