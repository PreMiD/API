import axios from "axios";
import { connect, pmdDB } from "../db/client";

let collection = null;

const config = {
  crowdinBase: process.env.CROWDINBASE,
  webhookUri: process.env.CROWDINWEBHOOK,
  roleId: process.env.ROLEID || "502148045991968788",
};

export async function initialize() {
  connect()
    .then(async () => {
      collection = pmdDB.collection("crowdin");

      firstTimeInitialization();
      setInterval(checkForChanges, 900000); // 15 minutes interval;
    })
    .catch(null);
}

async function firstTimeInitialization() {
  let { data } = await axios.get(config.crowdinBase).catch(null);
  let cleanData = tidyApiData(data);

  let item = await collection.findOne({ id: "crowdin_old_data " });

  if (!item) {
    await collection.insertOne({ id: "crowdin_old_data", items: cleanData });
  } else if ((item && !item.items) || (item && !item.items.length)) {
    collection.findOneAndUpdate(
      { id: "crowdin_old_data" },
      { items: cleanData }
    );
  } else return;
}

async function checkForChanges() {
  try {
    let { data } = await axios.get(config.crowdinBase).catch(null);
    let { items } = await collection.findOne({ id: "crowdin_old_data" });

    sendDiscord(compareChanges(items, tidyApiData(data)));
  } catch (err) {
    return;
  }
}

function compareChanges(oldData, newData) {
  if (!oldData || !newData) return;

  let changes = {
    website: [],
    docs: [],
  };

  oldData.website?.forEach((d, index) => {
    if (Number(d.phrases) < Number(newData.website[index]?.phrases))
      return changes.website.push({
        file: d.name,
        newStrings: Number(newData.website[index].phrases) - Number(d.phrases),
      });
  });

  oldData.docs?.forEach((d, index) => {
    if (Number(d.phrases) < Number(newData.docs[index]?.phrases))
      return changes.docs.push({
        file: d.name,
        newStrings: Number(newData.docs[index].phrases) - Number(d.phrases),
      });
  });

  return changes;
}

async function sendDiscord(changes) {
  let array = {
    website: [],
    docs: [],
  };

  changes.website
    ? changes.website.map((f) =>
        array.website.push(
          `Added \`${f.newStrings}\` new string${
            f.newStrings > 1 ? "s" : ""
          } to: \`${f.file}\``
        )
      )
    : false;

  changes.docs
    ? changes.docs.map((f) =>
        array.docs.push(
          `Added \`${f.newStrings}\` new string${
            f.newStrings > 1 ? "s" : ""
          } to: \`${f.file}\``
        )
      )
    : false;

  if (!array.website.length && !array.docs.length) return;

  let scheme = {
    content: `Hey <@&${config.roleId}> :wave:`,
    embeds: [
      {
        title: "New strings!",
        url: "https://trasnlate.premid.app",
        description:
          `${
            array.website.length > 0
              ? `**Website**\n${array.website.join("\n")}`
              : ""
          }` +
          `${
            array.docs.length > 0
              ? `\n\n**Documentation**\n${array.docs.join("\n")}`
              : ""
          }`,
        color: 3770558,
        timestamp: new Date(),
      },
    ],
  };

  axios.post(config.webhookUri, scheme).catch(null);
  await collection.findOneAndUpdate(
    { id: "crowdin_old_data" },
    { items: changes }
  );
}

function tidyApiData(pureData) {
  let master = pureData.files.find((file) => file.name == "master");
  let documentation = pureData.files.find((file) => file.name == "documentation");

  let result = {
    website: [],
    docs: [],
  };

  master.files[0].files[0].files.forEach((file) => {
    return result.website.push({
      name: file.name,
      phrases: Number(file.phrases),
    });
  });

  documentation.files[0].files.forEach((file) => {
    file.files?.forEach((f) => {
      return result.docs.push({ name: f.name, phrases: Number(f.phrases) });
    });

    if (!file.files)
      return result.docs.push({
        name: file.name,
        phrases: Number(file.phrases),
      });
  });

  return result;
}
