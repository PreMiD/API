import { Response, Request } from "express";
import updatePresences from "../util/functions/updatePresences";

//TODO Make this code fancy at some point...
export = async (req: Request, res: Response) => {
  if (req.params.secret !== process.env.PRESENCEUPDATERSECRET) {
    res.sendStatus(405);
    return;
  }

  res.sendStatus(200);

  updatePresences();
};
