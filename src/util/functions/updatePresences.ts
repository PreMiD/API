import Octokit from "@octokit/rest";
import axios from "axios";
import { MongoClient, connect } from "../../db/client";
import { config } from "dotenv";
config();

const octokit = new Octokit({ auth: process.env.PRESENCEUPDATERTOKEN });

connect("PreMiD API - Presence Updater").then(updatePresences);

async function updatePresences() {
  var coll = MongoClient.db("PreMiD").collection("presences"),
    lastSavedCommit = (await MongoClient.db("PreMiD")
      .collection("updaters")
      .findOne(
        { name: "presences" },
        { projection: { _id: false, name: false } }
      )).lastCommit,
    lastCommit = (await octokit.repos.listCommits({
      owner: "PreMiD",
      repo: "Presences",
      per_page: 1
    })).data[0].sha;

  //* return if matches current one
  if (lastCommit === lastSavedCommit) {
    await MongoClient.close();
    process.exit();
  }

  var dbPresences = await coll
    .find({}, { projection: { _id: false } })
    .toArray();

  var presences = await Promise.all<any>(
    (await octokit.repos.getContents({
      owner: "PreMiD",
      repo: "Presences",
      path: "/"
    })).data
      .filter(
        f =>
          f.type === "dir" && !f.name.startsWith(".") && !f.name.startsWith("@")
      )
      .map(async f => {
        var metadata = (await axios.get(
            `https://raw.githubusercontent.com/PreMiD/Presences/master/${encodeURI(
              f.name
            )}/dist/metadata.json`
          )).data,
          presence = (await axios.get(
            `https://raw.githubusercontent.com/PreMiD/Presences/master/${encodeURI(
              f.name
            )}/dist/presence.js`
          )).data;

        var res = {
          name: metadata.service,
          url: `https://api.premid.app/v2/presences/${metadata.service}/`,
          metadata: metadata,
          presenceJs: presence
        };

        if (typeof metadata.iframe !== "undefined" && metadata.iframe) {
          // @ts-ignore
          res.iframeJs = (await axios.get(
            `https://raw.githubusercontent.com/PreMiD/Presences/master/${encodeURI(
              f.name
            )}/dist/iframe.js`
          )).data;
        }

        return res;
      })
  );

  //* Add missing presences
  var pTA = presences.filter(
      p => typeof dbPresences.find(p1 => p1.name === p.name) === "undefined"
    ),
    pTU = presences.filter(
      p => typeof dbPresences.find(p1 => p1.name === p.name) !== "undefined"
    ),
    pTD = dbPresences.filter(
      p => typeof presences.find(p1 => p1.name === p.name) === "undefined"
    );

  //* If there are new presences, add
  if (pTA.length > 0) await coll.insertMany(pTA);

  //* Update the other ones
  await Promise.all(pTU.map(p => coll.findOneAndReplace({ name: p.name }, p)));

  //* Delete removed ones
  await Promise.all(pTD.map(p => coll.findOneAndDelete({ name: p.name })));

  //* Update last commit change in db
  await MongoClient.db("PreMiD")
    .collection("updaters")
    .findOneAndUpdate(
      { name: "presences" },
      { $set: { lastCommit: lastCommit } }
    );

  //* Disconnect from db
  await MongoClient.close();

  process.exit();
}
