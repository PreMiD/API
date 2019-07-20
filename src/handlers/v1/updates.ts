import { Response, Request } from "express";

export = async (_req: Request, res: Response) => {
  //* Send response
  res.send(require("./data/updates.json"));
};
