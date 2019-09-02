import { RequestHandler } from "express";
import { MongoClient } from "../../db/client";
import { Changelog } from "../../db/types";

const handler: RequestHandler = async (req, res) => {
  const { project, version } = req.params;
  const database = MongoClient.db("PreMiD");
  const changelogCollection = database.collection<Changelog>("changelog");

  if (!project) {
    res.send({ error: 1, message: "No project providen." });
    return;
  }

  const filter = !version ? { project } : { project, version };
  const changelog = await changelogCollection
    .find(filter, { projection: { _id: false } })
    .toArray();

  res.send(changelog);
};

export default handler;
