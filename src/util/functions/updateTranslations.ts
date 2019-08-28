import { connect, MongoClient } from "../../db/client";
import { config } from "dotenv";
import axios from "axios";
import { ensureDir, readdir, readFile, emptyDirSync } from "fs-extra";
import unzipper from "unzipper";
config();

var base = "https://api.crowdin.com/api/project/premid/";

connect("PreMiD API - Translation Updater").then(run);

async function run() {
  var coll = MongoClient.db("PreMiD").collection("langFiles");

  //* No new translations, skip
  var res = await axios.get("export", {
    baseURL: base,
    params: { key: process.env.CROWDIN_API_TOKEN, json: true, async: true }
  });
  if (res.data.success.status === "skipped") {
    MongoClient.close().then(() => process.exit());
    return;
  }

  //* Ensure tmp dir is there
  await ensureDir("tmp");
  await emptyDirSync("tmp");

  //* Create writer
  var writer = unzipper.Extract({ path: "tmp/translations" });
  //* Request download
  axios
    .get("download/all.zip", {
      baseURL: base,
      params: { key: process.env.CROWDIN_API_TOKEN },
      responseType: "stream"
    })
    .then(res => {
      res.data.pipe(writer);
    });

  //* If writer ends, file downloaded
  writer.once("close", async () => {
    var folders = await readdir("tmp/translations/master"),
      translations = [];
    Promise.all(
      folders.map(async f => {
        var extension = await Promise.all(
            (await readdir(`tmp/translations/master/${f}/Extension`)).map(
              async f1 =>
                JSON.parse(
                  await readFile(
                    `tmp/translations/master/${f}/Extension/${f1}`,
                    "utf-8"
                  )
                )
            )
          ),
          website = await Promise.all(
            (await readdir(`tmp/translations/master/${f}/Website`)).map(
              async f1 =>
                JSON.parse(
                  await readFile(
                    `tmp/translations/master/${f}/Website/${f1}`,
                    "utf-8"
                  )
                )
            )
          );

        translations.push({
          lang:
            f.slice(0, 2) == f.slice(3, 5).toLocaleLowerCase()
              ? f.slice(0, 2)
              : f.replace("-", "_"),
          translations: Object.assign(
            {},
            ...extension.map(ex =>
              Object.assign(
                //@ts-ignore
                ...Object.keys(ex).map(v => {
                  ex[v] = ex[v].message;
                  return { [v.replace(/[.]/g, "_")]: ex[v] };
                })
              )
            )
          ),
          project: "extension"
        });

        translations.push({
          lang:
            f.slice(0, 2) == f.slice(3, 5).toLocaleLowerCase()
              ? f.slice(0, 2)
              : f.replace("-", "_"),
          translations: Object.assign(
            {},
            ...website.map(web =>
              Object.assign(
                //@ts-ignore
                ...Object.keys(web).map(v => {
                  web[v] = web[v].message;
                  return { [v.replace(/[.]/g, "_")]: web[v] };
                })
              )
            )
          ),
          project: "website"
        });
      })
    ).then(() => {
      Promise.all(
        translations.map(async t => {
          if (await coll.findOne({ lang: t.lang, project: t.project }))
            await coll.findOneAndReplace(
              { lang: t.lang, project: t.project },
              t
            );
          else await coll.insertOne(t);
        })
      ).then(() => {
        MongoClient.close().then(() => process.exit());
      });
    });
  });
}
