import { connect, MongoClient } from "./db/client";
import { config } from "dotenv";
import express from "express";
import { success, error, info } from "./util/debug";
import getWebstoreUsers from "./util/functions/getWebstoreUsers";
import { fork } from "child_process";

config();

var app = express(),
  apiVersion = require("./package.json").version;

info(`Version v${apiVersion}`);

//* Remove powered by header
app.disable("x-powered-by");

//* Set API Headers
app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header("API-Version", apiVersion);
  next();
});

(async () => {
  //* Connect to Mongo DB
  await connect()
    .then(_ => success("Connected to the database"))
    .catch((err: Error) => {
      error(`Could not connect to database: ${err.name}`);
      process.exit();
    });

  //* Read endpoints
  require("./endpoints.json").map(endpoint =>
    app.get(endpoint.path, require(`./handlers/${endpoint.handler}`))
  );

  //* Request not handled, send 404
  app.use((_req, res) => {
    //* Set headers
    res.sendStatus(404);
  });

  var server = app.listen(3001, async () => {
    // @ts-ignore
    success(`Listening on port ${server.address().port}`);

    if (process.env.NODE_ENV === "production") {
      setInterval(updateLangFiles, 5 * 1000 * 60);
      updateLangFiles();

      //* Update usage
      updateUsage();
      setInterval(updateUsage, 60 * 60 * 1000);

      //* Response Time check
      setInterval(updateResponseTime, 5 * 60 * 1000);

      //* Update presences
      updatePresences();
      setInterval(updatePresences, 5 * 60 * 1000);
    }
  });
})();

async function updateUsage() {
  MongoClient.db("PreMiD")
    .collection("usage")
    .findOneAndReplace(
      { key: 0 },
      {
        key: 0,
        chrome: await getWebstoreUsers("agjnjboanicjcpenljmaaigopkgdnihi")
      }
    );
}

function updatePresences() {
  var pUTime = Date.now(),
    presenceUpdater = fork("util/functions/updatePresences.js");
  presenceUpdater.on("close", () => {
    success(`Updated presences in ${Date.now() - pUTime}ms`);
  });
}

function updateLangFiles() {
  var lUTime = Date.now(),
    presenceUpdater = fork("util/functions/updateTranslations.js");
  presenceUpdater.on("close", () => {
    success(`Updated translations in ${Date.now() - lUTime}ms`);
  });
}

function updateResponseTime() {
  var lUTime = Date.now(),
    presenceUpdater = fork("util/responseTime.js");
  presenceUpdater.on("close", () => {
    success(`Updated response Time in ${Date.now() - lUTime}ms`);
  });
}
