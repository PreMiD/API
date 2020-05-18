import axios from "axios";
import { connect, pmdDB } from "../db/client";

let collection = null;

const config = {
  crowdinBase: process.env.CROWDINBASE,
  webhookUri: process.env.CROWDINWEBHOOK,
  roleId: process.env.ROLEID || "502148045991968788",
};

export async function initialize() {
  if (!config.crowdinBase || !config.webhookUri)
    return console.warn(
      "[WARN] Some config options are not set correctly. Please check your environment variables and make sure 'CROWDINBASE' and 'CROWDINEBHOOK' exist."
    );

  connect()
    .then(async () => {
      collection = pmdDB.collection("crowdin");

      firstTimeInitialization();
      setInterval(checkForChanges, 600000); // 10 minutes interval;
    })
    .catch(null);
}

async function checkForChanges() {
  try {
    let { data } = await axios.get(config.crowdinBase).catch(null);
    let { items } = await collection
      .findOne({ id: "crowdin_old_data" })
      .catch(null);

    sendDiscord(await compareChanges(items, tidyApiData(data)));
  } catch (err) {
    return;
  }
}

async function firstTimeInitialization() {
  let { data } = await axios.get(config.crowdinBase).catch(null);

  let item = await collection.findOne({ id: "crowdin_old_data" });

  if (!item) {
    await collection.insertOne({
      id: "crowdin_old_data",
      items: tidyApiData(data),
    });
  } else if ((item && !item.items) || (item && !item.items.length)) {
    collection.updateOne(
      { id: "crowdin_old_data" },
      { $set: { items: tidyApiData(data) } }
    );
  } else return;
}

async function compareChanges(oldData, newData) {
  try {
    if (!oldData || !newData) return;

    let changes: {
      master: object[];
      documentation: object[];
      totalNewStrings: number;
      deletedFiles: { master: string[]; documentation: string[] };
      newFiles: { master: string[]; documentation: string[] };
    } = {
      master: [],
      documentation: [],
      totalNewStrings: 0,
      deletedFiles: { master: [], documentation: [] },
      newFiles: { master: [], documentation: [] },
    };

    let allFiles: {
      master: {
        old: string[];
        new: string[];
        deletedFiles: string[];
        newFiles: string[];
      };
      documentation: {
        old: string[];
        new: string[];
        deletedFiles: string[];
        newFiles: string[];
      };
    } = {
      master: {
        old: [],
        new: [],
        deletedFiles: [],
        newFiles: [],
      },
      documentation: {
        old: [],
        new: [],
        deletedFiles: [],
        newFiles: [],
      },
    };

    for (let item of oldData.master) {
      /*
      For now we don't have single files on master (Website, Extension and Presence categories), but if someone adds a single file by accident, or if it was added on purpose, we add this to make API ignore that file. This will change in the future if we decide to add single files to master. For now, we don't need anymore code in this file.
    */
      if (!item.folder) return;

      for (let folder of item.files) {
        allFiles.master.old.push(folder.file);
      }
    }

    for (let item of newData.master) {
      if (!item.folder) return;

      for (let folder of item.files) {
        allFiles.master.new.push(folder.file);
      }
    }

    for (let item of oldData.documentation) {
      if (item?.folder)
        for (let folder of item.files) {
          allFiles.documentation.old.push(folder.file);
        }
      else if (item?.file) allFiles.documentation.old.push(item.file);
    }

    for (let item of newData.documentation) {
      if (item?.folder)
        for (let folder of item.files) {
          allFiles.documentation.new.push(folder.file);
        }
      else if (item?.file) allFiles.documentation.new.push(item.file);
    }

    Object.keys(oldData.master).forEach((key: string) => {
      /* Check if any of the files has more phrases than 10 minutes before */
      oldData.master[key].files.forEach(
        (file: { file: string; phrases: number }) => {
          if (
            file.phrases <
            newData.master[key].files.find(
              (f: { file: string }) => f.file == file.file
            )?.phrases
          ) {
            changes.master.push({
              file: file.file,
              newStrings:
                newData.master[key].files.find(
                  (f: { file: string }) => f.file == file.file
                )?.phrases - file.phrases,
            });

            changes.totalNewStrings +=
              newData.master[key].files.find(
                (f: { file: string }) => f.file == file.file
              )?.phrases - file.phrases;
          }
        }
      );
    });

    Object.keys(newData.documentation).forEach((key: string) => {
      /* Check if any of the documentation files has more phrases than 10 minutes before */
      if (oldData.documentation[key]?.folder) {
        oldData.documentation[key].files?.forEach(
          (file: { file: string; phrases: number }) => {
            if (
              !newData.documentation[key].files.find(
                (f: { file: string }) => f.file == file.file
              )
            )
              return;
            else if (
              file.phrases <
              newData.documentation[key].files.find(
                (f: { file: string }) => f.file == file.file
              )?.phrases
            ) {
              changes.documentation.push({
                file: file.file,
                newStrings:
                  newData.documentation[key].files.find(
                    (f) => f.file == file.file
                  )?.phrases - file.phrases,
              });

              changes.totalNewStrings +=
                newData.documentation[key].files.find(
                  (f) => f.file == file.file
                )?.phrases - file.phrases;
            }
          }
        );
      } else if (oldData.documentation[key]?.file) {
        if (
          oldData.documentation[key].file !== newData.documentation[key].file ||
          newData.documentation[key].phrases -
            oldData.documentation[key].phrases <
            1
        )
          return;

        changes.documentation.push({
          file: oldData.documentation[key].file,
          newStrings:
            newData.documentation[key].phrases -
            oldData.documentation[key].phrases,
        });

        changes.totalNewStrings +=
          newData.documentation[key].phrases -
          oldData.documentation[key].phrases;
      }
    });

    /* Push new and deleted files into the right array */
    allFiles.master.old.forEach((file: string) => {
      if (allFiles.master.deletedFiles.includes(file)) return;
      return allFiles.master.new.includes(file)
        ? false
        : allFiles.master.deletedFiles.push(file);
    });

    allFiles.master.new.forEach((file: string) => {
      if (allFiles.master.newFiles.includes(file)) return;
      return allFiles.master.old.includes(file)
        ? false
        : allFiles.master.newFiles.push(file);
    });

    allFiles.documentation.old.forEach((file: string) => {
      if (allFiles.documentation.deletedFiles.includes(file)) return;
      return allFiles.documentation.new.includes(file)
        ? false
        : allFiles.documentation.deletedFiles.push(file);
    });

    allFiles.documentation.new.forEach((file: string) => {
      if (allFiles.documentation.newFiles.includes(file)) return;
      return allFiles.documentation.old.includes(file)
        ? false
        : allFiles.documentation.newFiles.push(file);
    });

    allFiles.master.deletedFiles.map((file) =>
      changes.deletedFiles.master.push(file)
    );
    allFiles.master.newFiles.map((file) => changes.newFiles.master.push(file));

    allFiles.documentation.deletedFiles.map((file) =>
      changes.deletedFiles.documentation.push(file)
    );
    allFiles.documentation.newFiles.map((file) =>
      changes.newFiles.documentation.push(file)
    );

    /* Update database value */
    await collection.updateOne(
      { id: "crowdin_old_data" },
      { $set: { items: newData } }
    );

    return changes;
  } catch (err) {
    return null;
  }
}

function tidyApiData(pureData) {
  let object = {
    master: [],
    documentation: [],
  };

  pureData.files[0].files[0].files.forEach((file) =>
    object.master.push({
      folder: file?.name,
      files:
        file?.files?.map((f) => {
          return { file: f.name, phrases: Number(f.phrases) };
        }) || file,
    })
  );

  pureData.files[1].files[0].files.forEach((file) => {
    if (file?.["node_type"] == "file")
      return object.documentation.push({
        file: file.name,
        phrases: Number(file.phrases),
      });

    object.documentation.push({
      folder: file?.name,
      files:
        file?.files?.map((f) => {
          return { file: f.name, phrases: Number(f.phrases) };
        }) || file,
    });
  });

  return object;
}

async function sendDiscord(changes) {
  if (
    !changes ||
    !changes.deletedFiles.master ||
    !changes.deletedFiles.documentation ||
    !changes.newFiles.master ||
    !changes.newFiles.documentation
  )
    return;

  let array = {
    master: [],
    docs: [],
    deletedFiles: [
      ...changes.deletedFiles.master,
      ...changes.deletedFiles.documentation,
    ],
    newFiles: [...changes.newFiles.master, ...changes.newFiles.documentation],
    totalNewStrings: changes.totalNewStrings,
  };

  for (let item of changes.master) {
    array.master.push(
      `Added ${item.newStrings} new string${
        item.newStrings > 1 ? "s" : ""
      } to: \`${item.file}\``
    );
  }

  for (let item of changes.documentation) {
    array.docs.push(
      `Added ${item.newStrings} new string${
        item.newStrings > 1 ? "s" : ""
      } to: \`${item.file}\``
    );
  }

  if (
    !array.master.length &&
    !array.docs.length &&
    !array.newFiles.length &&
    !array.deletedFiles.length
  )
    return;

  let scheme = {
    content: `Hey ${
      array.totalNewStrings >= 3 || array.newFiles.length
        ? `<@&${config.roleId}>`
        : "there"
    } :wave: We have ${
      array.totalNewStrings > 0
        ? `added \`${array.totalNewStrings}\` new string${
            array.totalNewStrings > 1 ? "s" : ""
          } to Crowdin! Please check them out when you have time :blue_heart:`
        : `${
            array.newFiles.length
              ? "added some new files to Crowdin!"
              : "some changes on our Crowdin."
          } `
    }`,
    embeds: [
      {
        description:
          `${
            array.master.length > 0
              ? `**Website**\n${array.master.join("\n")}`
              : ""
          }` +
          `${
            array.docs.length > 0
              ? `\n\n**Documentation**\n${array.docs.join("\n")}`
              : ""
          }` +
          `${
            array.newFiles.length
              ? `\n\n**New files**\n${array.newFiles
                  .map((f) => `\`${f}\``)
                  .join(", ")}`
              : ""
          }` +
          `${
            array.deletedFiles.length
              ? `\n\n**Deleted files**\n${array.deletedFiles
                  .map((f) => `\`${f}\``)
                  .join(", ")}`
              : ""
          }` +
          `${
            array.totalNewStrings || array.newFiles.length
              ? "\n\n[Click here](https://translate.premid.app) to start translating."
              : ""
          }`,
        color: 3770558,
        timestamp: new Date(),
      },
    ],
  };

  await axios.post(config.webhookUri, scheme).catch(null);
}
