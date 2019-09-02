import Octokit from "@octokit/rest";
import axios from "axios";
import { MongoClient, connect } from "../../db/client";
import { Presence, PresenceMetadata } from "../../db/types";
import { config } from "dotenv";
config();

const octokit = new Octokit({ auth: process.env.PRESENCEUPDATERTOKEN });

connect("PreMiD API - Presence Updater").then(updatePresences);

interface GitDirItem {
  type: "file" | "dir";
  name: string;
}

const getPresencesListFromGitHub = async () => {
  const contents = await octokit.repos.getContents({
    owner: "PreMiD",
    path: "/",
    repo: "Presences"
  });
  const items: GitDirItem[] = contents.data;
  return items
    .filter(
      item =>
        item.type === "dir" &&
        !item.name.startsWith(".") &&
        !item.name.startsWith("@"),
    )
    .map(item => item.name);
};

const buildPresenceDocument = async (name: string) => {
  const baseURL = `https://raw.githubusercontent.com/PreMiD/Presences/master/${encodeURI(
    name,
  )}/dist`;
  const [metadata, presenceJs] = await Promise.all([
    axios.get<PresenceMetadata>("metadata.json", { baseURL }).then(r => r.data),
    axios.get<string>("presence.js", { baseURL }).then(r => r.data),
  ]);

  const presence: Presence = {
    metadata,
    name,
    presenceJs,
    url: `https://api.premid.app/v2/presences/${metadata.service}/`,
  };

  if (metadata.iframe) {
    presence.iframeJs = (await axios.get<string>("iframe.js", {
      baseURL,
    })).data;
  }

  return presence;
};

const getLastCommitSha = async (): Promise<string> => {
  const commits = await octokit.repos.listCommits({
    owner: "PreMiD",
    per_page: 1,
    repo: "Presences",
  });
  return commits.data.shift().sha;
};

async function updatePresences() {
  const database = MongoClient.db("PreMiD");
  const presencesCollection = database.collection<Presence>("presences");
  const updatersCollection = database.collection("updaters");

  const presencesUpdaterDocument = await updatersCollection.findOne(
    { name: "presences" },
    { projection: { _id: false, name: false } },
  );
  const lastSavedCommitSha = <string>presencesUpdaterDocument.lastCommit;
  const lastCommitSha = await getLastCommitSha();

  //* return if nothing has changed
  if (lastCommitSha === lastSavedCommitSha) {
    await MongoClient.close();
    process.exit();
    return;
  }

  const databasePresences = await presencesCollection
    .find({}, { projection: { _id: false } })
    .toArray();

  //* get presences from the github repository
  const presencesNamesList = await getPresencesListFromGitHub();
  const githubPresences = await Promise.all(
    presencesNamesList.map(buildPresenceDocument),
  );

  //* list new presences from github
  const newPresences = githubPresences.filter(
    p => !databasePresences.some(dp => dp.name === p.name),
  );
  console.log(`${newPresences.length} new presences.`);

  //* list outdated presences from github
  const outdatedPresences = githubPresences.filter(p =>
    databasePresences.some(dp => dp.name === p.name),
  );
  console.log(`${outdatedPresences.length} outdated presences.`);

  //* list deleted presences from github
  const deletedPresences = databasePresences.filter(
    p => !githubPresences.some(gp => gp.name === p.name),
  );
  console.log(`${deletedPresences.length} deleted presences.`);

  const promises: Promise<any>[] = [];

  //* If there are new presences, add
  promises.push(presencesCollection.insertMany(newPresences));

  //* Update the other ones
  promises.push(
    ...outdatedPresences.map(p =>
      presencesCollection.findOneAndReplace({ name: p.name }, p),
    )
  );

  //* Delete removed ones
  promises.push(
    ...deletedPresences.map(p =>
      presencesCollection.findOneAndDelete({ name: p.name }),
    ),
  );

  await Promise.all(promises);

  //* Update last commit change in db
  await updatersCollection.updateOne(
    { name: "presences" },
    { $set: { lastCommit: lastCommitSha } },
  );

  //* Disconnect from db
  await MongoClient.close();
  process.exit();
}
