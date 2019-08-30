import { Response, Request } from "express";
import { MongoClient } from "../../db/client";

export = async (req: Request, res: Response) => {
  var presences;
  if (
    typeof req.params.presence === "undefined" ||
    req.params.presence === "versions"
  ) {
    if (req.params.presence === "versions") {
      presences = (await MongoClient.db("PreMiD")
        .collection("presences")
        .find(
          {},
          { projection: { _id: false, presenceJs: false, iframeJs: false } }
        )
        .toArray()).map(p => {
        return { name: p.name, version: p.metadata.version, url: p.url };
      });
      res.send(presences);
    }
    presences = (await MongoClient.db("PreMiD")
      .collection("presences")
      .find(
        {},
        { projection: { _id: false, presenceJs: false, iframeJs: false } }
      )
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
    if (!presences) res.send({ error: 4, message: "No such presence." });
    else res.send(presences);
  } else if (
    req.params.file === "presence.js" ||
    req.params.file === "iframe.js" ||
    req.params.file === "metadata.json"
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
    } else if (req.params.file === "iframe.js") {
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
    } else {
      presences = await MongoClient.db("PreMiD")
        .collection("presences")
        .findOne(
          { name: req.params.presence },
          {
            projection: {
              _id: false,
              name: false,
              iframeJs: false,
              presenceJs: false,
              url: false
            }
          }
        );

      res.send(presences.metadata);
      return;
    }

    res.setHeader("content-type", "text/javascript");
    if (!presences) res.send({ error: 5, message: "No such file." });
    else res.end(unescape(presences.presenceJs || presences.iframeJs));
  }
};
