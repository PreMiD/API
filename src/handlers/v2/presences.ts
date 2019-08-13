import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export = async (req: Request, res: Response) => {
  var presences;
  if (typeof req.params.presence === "undefined") {
    presences = (await MongoClient.db("PreMiD")
      .collection("presences")
      .find({}, { projection: { _id: false } })
      .toArray()).map(pr => {
      return pr;
    });

    res.send(presences);
  } else if (typeof req.params.file === "undefined") {
    presences = await MongoClient.db("PreMiD")
      .collection("presences")
      .findOne(
        { name: req.params.presence },
        { projection: { _id: false, presenceJs: false, iframeJs: false } }
      );
    if (!presences) res.sendStatus(404);
    else res.send(presences);
  } else if (
    req.params.file === "presence.js" ||
    req.params.file === "iframe.js"
  ) {
    if (req.params.file === "presence.js") {
      presences = await MongoClient.db("PreMiD")
        .collection("presences")
        .findOne(
          { name: req.params.presence },
          {
            projection: {
              _id: false,
              name: false,
              metadata: false,
              iframeJs: false,
              url: false
            }
          }
        );
    } else {
      presences = await MongoClient.db("PreMiD")
        .collection("presences")
        .findOne(
          { name: req.params.presence },
          {
            projection: {
              _id: false,
              name: false,
              metadata: false,
              presenceJs: false,
              url: false
            }
          }
        );
    }

    res.setHeader("content-type", "text/javascript");
    if (!presences) res.sendStatus(404);
    else res.end(unescape(presences.presenceJs || presences.iframeJs));
  }
};
