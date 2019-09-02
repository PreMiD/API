import { Response, Request } from "express";

export const handler = async (_req: Request, res: Response) => {
  //* Send response
  res.send(require("./data/updates.json"));
};
