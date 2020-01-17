import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const presences = pmdDB.collection("presences");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  //* If presence not set
  if (!req.params["presence"]) {
    //* send all presences
    //* return
    res.send(
      (
        await presences
          .find(
            {},
            { projection: { _id: false, presenceJs: false, iframeJs: false } }
          )
          .toArray()
      ).map(presence => {
        const noImgur = imgurReplacer(presence);
        return noImgur;
      })
    );
    return;
  }

  //* If presence "name" === versions
  if (req.params["presence"] === "versions") {
    res.send(
      (
        await presences
          .find(
            {},
            {
              projection: { _id: false, name: true, url: true, metadata: true }
            }
          )
          .toArray()
      ).map(p => {
        return { name: p.name, url: p.url, version: p.metadata.version };
      })
    );
    return;
  }

  //* If file not set
  if (!req.params["file"]) {
    //* Find presence
    const presence = await presences.findOne(
      { name: req.params["presence"] },
      { projection: { _id: false, metadata: true, name: true, url: true } }
    );

    //* If not found
    if (!presence) {
      //* Send error
      //* return
      res.send({ error: 4, message: "No such presence." });
      return;
    }

    //* If found send response
    //* return
    const noImgur = imgurReplacer(presence);
    res.send(noImgur);
    return;
  }

  //* projection disable _id
  //* switch case file
  let projection: any = { _id: false };
  switch (req.params["file"]) {
    case "metadata.json":
      //* Enable metadata
      //* return
      projection.metadata = true;
      break;
    case "presence.js":
      //* Enable presence
      //* return
      projection.presenceJs = true;
      break;
    case "iframe.js":
      //* Enable iframe
      //* return
      projection.iframeJs = true;
      break;
    default:
      //* send error
      //* return
      res.send({ error: 5, message: "No such file." });
      return;
  }

  //* find presence
  //* set response
  const presence = await presences.findOne(
    {
      name: req.params["presence"]
    },
    { projection: projection }
  );
  let response: any = presence[Object.keys(projection).reverse()[0]];

  //* If file ends with .js
  //* send response
  if (req.params["file"].endsWith(".js")) {
    //* set header JS file
    //* unescape file
    res.setHeader("content-type", "text/javascript");
    response = unescape(<string>response);
  }
  res.send(response);
};

function imgurReplacer(presence) {
  if (presence.metadata.logo.includes("imgur.com"))
    presence.metadata.logo =
      "https://proxy.duckduckgo.com/iu/?u=" + presence.metadata.logo;
  if (presence.metadata.thumbnail.includes("imgur.com"))
    presence.metadata.thumbnail =
      "https://proxy.duckduckgo.com/iu/?u=" + presence.metadata.thumbnail;

  return presence;
}

//* Export handler
export { handler };
