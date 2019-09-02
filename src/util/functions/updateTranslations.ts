import axios from "axios";
import { config } from "dotenv";
import { emptyDir, ensureDir, readdir, readFile } from "fs-extra";
import { Collection } from "mongodb";
import { Stream } from "stream";
import unzipper from "unzipper";
import { connect, MongoClient } from "../../db/client";
import { LangFile } from "../../db/types";
import { error } from "../debug";
config();

connect("PreMiD API - Translation Updater").then(run);

interface CrowdinExportResponse {
  success: {
    status: string;
  };
}

interface TranslationJsonFile {
  [key: string]: {
    message: string;
    description: string;
  };
}

const readAllTranslationFiles = async (folderPath: string) => {
  const files = await readdir(folderPath);
  return Promise.all(
    files.map(
      async file =>
        <TranslationJsonFile>(
          JSON.parse(await readFile(`${folderPath}/${file}`, "utf-8"))
        )
    )
  );
};

const saveLangFile = async (
  collection: Collection<LangFile>,
  langFile: LangFile
) => {
  const exists =
    typeof (await collection.findOne({
      lang: langFile.lang,
      project: langFile.project
    })) !== "undefined";

  return exists
    ? collection.findOneAndReplace(
        { lang: langFile.lang, project: langFile.project },
        langFile
      )
    : collection.insertOne(langFile);
};

async function run() {
  const crowdinApi = "https://api.crowdin.com/api/project/premid/";
  const database = MongoClient.db("PreMiD");
  const langFilesCollection = database.collection<LangFile>("langFiles");

  //* No new translations, skip
  try {
    const exportResponse = await axios.get<CrowdinExportResponse>("export", {
      baseURL: crowdinApi,
      params: { key: process.env.CROWDIN_API_TOKEN, json: true, async: true }
    });

    if (exportResponse.data.success.status === "skipped") {
      await MongoClient.close();
      process.exit();
      return;
    }
  } catch (err) {
    error(err.message);
    process.exit(1);
    return;
  }

  //* Ensure tmp dir is there
  await ensureDir("tmp");
  await emptyDir("tmp");

  //* Create writer
  const writer = unzipper.Extract({ path: "tmp/translations" });
  //* Request download
  try {
    const downloadResponse = await axios.get<Stream>("download/all.zip", {
      baseURL: crowdinApi,
      params: { key: process.env.CROWDIN_API_TOKEN },
      responseType: "stream"
    });
    downloadResponse.data.pipe(writer);
  } catch (err) {
    error(err.message);
    process.exit(1);
    return;
  }

  //* If writer ends, file downloaded
  writer.once("close", async () => {
    const languagesFolders = await readdir("tmp/translations/master");

    const groupedTranslations = await Promise.all(
      languagesFolders.map(async languageFolder => {
        const languageCode =
          languageFolder.slice(0, 2) ===
          languageFolder.slice(3, 5).toLocaleLowerCase()
            ? languageFolder.slice(0, 2)
            : languageFolder.replace("-", "_");

        return [
          await readAllTranslationFiles(
            `tmp/translations/master/${languageFolder}/Extension`
          ),
          await readAllTranslationFiles(
            `tmp/translations/master/${languageFolder}/Website`
          )
        ].map(
          translations =>
            <LangFile>{
              lang: languageCode,
              translations: Object.assign(
                {},
                ...translations.map(ex =>
                  Object.assign(
                    {},
                    ...Object.keys(ex).map(v => ({
                      [v.replace(/[.]/g, "_")]: ex[v].message
                    }))
                  )
                )
              ),
              project: "extension"
            }
        );
      })
    );
    const translations = groupedTranslations.reduce(
      (array, group) => array.concat(group),
      []
    );

    await Promise.all(
      translations.map(saveLangFile.bind(undefined, langFilesCollection))
    );
    await MongoClient.close();
    process.exit();
  });
}

function cleanup() {
  MongoClient.close().then(() => process.exit());
}
