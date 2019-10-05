import { fork } from "child_process";
import { config } from "dotenv";
import express from "express";
import { connect, MongoClient } from "./db/client";
import { error, info, success } from "./util/debug";
import { getWebstoreUsers } from "./util/functions/getWebstoreUsers";
// @ts-ignore
import { version as apiVersion } from "./package.json";
config();

const apiVersion: string = require("./package.json").version;
import endpoints from "./endpoints.json";

const start = async (): Promise<void> => {
  info(`Version v${apiVersion}`);

  //* Connect to Mongo DB
  try {
    await connect();
    success("Connected to the database");
  } catch (err) {
    error(`Could not connect to database: ${err.message}`);
    process.exit();
    return;
  }

  const app = express();

  //* Remove powered by header
  app.disable("x-powered-by");

  //* Set API Headers
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    res.header("API-Version", apiVersion);
    next();
  });

  //* Set endpoints
  try {
    info(`Loading ${endpoints.length} endpoints...`);
    await Promise.all(
      endpoints.map(async endpoint => {
        const module = await import(`./handlers/${endpoint.handler}`);
        app.get(endpoint.path, module.handler);
      })
    );
  } catch (err) {
    error(err.message);
    process.exit();
    return;
  }

  //* Request not handled, send 404
  app.use((_req, res) => {
    //* Set headers
    res.sendStatus(404);
  });

  const PORT = 3001;
  app.listen(PORT, async () => {
    success(`Listening on port ${PORT}`);

    if (process.env.NODE_ENV === "production") {
      const ONE_MINUTE = 1000 * 60;
      const updateTranslationsInterval = 5 * ONE_MINUTE;

      setInterval(updateTranslations, updateTranslationsInterval);
      updateTranslations();

      //* Update usage
      const updateUsageInterval = 5 * ONE_MINUTE;

      //setInterval(updateUsage, updateUsageInterval);
      //updateUsage();

      //* Response Time check
      const updateResponseTimeInterval = 5 * ONE_MINUTE;

      setInterval(updateResponseTime, updateResponseTimeInterval);
      updateResponseTime();

      //* Update presences
      const updatePresencesInterval = ONE_MINUTE*5;

      setInterval(updatePresences, updatePresencesInterval);
      updatePresences();
    }
  });
};

start();

async function updateUsage(): Promise<void> {
  var chromeData = await getWebstoreUsers();

  const collection = MongoClient.db("PreMiD").collection("usage");
  await collection.findOneAndUpdate(
    { key: 0 },
    {
      $set: {
        chrome: chromeData[0].users,
        version: chromeData[0].version
      }
    }
  );
}

const updatePresences = () => {
  const startTimestamp = Date.now();
  const presenceUpdater = fork("util/functions/updatePresences.js");
  presenceUpdater.on("exit", code =>
    code === 0
      ? success(`Updated presences in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating presences")
  );
};

const updateTranslations = () => {
  const startTimestamp = Date.now();
  const translationsUpdater = fork("util/functions/updateTranslations.js");
  translationsUpdater.on("exit", code =>
    code === 0
      ? success(`Updated translations in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating translations")
  );
};

const updateResponseTime = () => {
  const startTimestamp = Date.now();
  const responseTimeUpdater = fork("./util/responseTime.js");
  responseTimeUpdater.on("exit", code =>
    code === 0
      ? success(`Updated response time in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating response time")
  );
};
