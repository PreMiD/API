import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const changelog = pmdDB.collection("changelog");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  //* project || version not set
  if (!req.params["project"] || !req.params["version"]) {
    //* send error
    //* return
    res.send({
      error: 1,
      message: `No ${!req.params["project"] ? "project" : "version"} providen.`
    });
    return;
  }

  //* Find changelog
  //* Send changelog
  const versionChangelog = await changelog
    .find(
      { project: req.params["project"], version: req.params["version"] },
      { projection: { _id: false } }
    )
    .toArray();
  res.send(versionChangelog);
};

//* Export handler
export { handler };
