import { RequestHandler } from "express";
import { MongoClient } from "../../db/client";
import { Presence } from "../../db/types";
import { Collection, FindOneOptions } from "mongodb";

const getAllPresences = (collection: Collection<Presence>) =>
  collection
    .find(
      {},
      { projection: { _id: false, presenceJs: false, iframeJs: false } }
    )
    .toArray();

const getAllPresencesVersions = async (collection: Collection<Presence>) =>
  (await getAllPresences(collection)).map(presence => ({
    name: presence.name,
    url: presence.url,
    version: presence.metadata.version,
  }));

const getPresenceByName = (
  collection: Collection<Presence>,
  name: string,
  options?: FindOneOptions,
) => collection.findOne({ name }, options);

const handler: RequestHandler = async (req, res) => {
  const { presence: presenceName, file: fileName } = req.params;
  const database = MongoClient.db("PreMiD");
  const presencesCollection = database.collection<Presence>("presences");

  if (typeof presenceName === "undefined") {
    res.send(await getAllPresences(presencesCollection));
    return;
  }

  if (presenceName === "versions") {
    res.send(await getAllPresencesVersions(presencesCollection));
    return;
  }

  if (typeof fileName === "undefined") {
    const presence = await getPresenceByName(
      presencesCollection,
      presenceName,
      { projection: { _id: false, presenceJs: false, iframeJs: false } }
    );

    res.send(!presence ? { error: 4, message: "No such presence." } : presence);
    return;
  }

  if (["presence.js", "iframe.js", "metadata.json"].includes(fileName)) {
    let projection: {
      [K in keyof Presence]?: boolean;
    };
    let field: keyof Presence;

    if (fileName === "presence.js") {
      projection = {
        _id: false,
        name: false,
        metadata: false,
        iframeJs: false,
        url: false
      };
      field = "presenceJs";
    } else if (fileName === "iframe.js") {
      projection = {
        _id: false,
        name: false,
        metadata: false,
        presenceJs: false,
        url: false
      };
      field = "iframeJs";
    } else if (fileName === "metadata.json") {
      projection = {
        _id: false,
        name: false,
        iframeJs: false,
        presenceJs: false,
        url: false
      };
      field = "metadata";
    }

    const presence = await getPresenceByName(
      presencesCollection,
      presenceName,
      { projection },
    );

    if (!presence) {
      res.send({ error: 5, message: "No such file." });
      return;
    }

    let response = presence[field];

    if (fileName.endsWith(".js")) {
      res.setHeader("content-type", "text/javascript");
      response = unescape(<string>response);
    }

    res.send(response);
  }
};

export { handler };
