import { fork } from "child_process";
import { config } from "dotenv";
import express, { response } from "express";
import { connect, MongoClient } from "./db/client";
import { error, info, success } from "./util/debug";
import getWebstoreUsers from "./util/functions/getWebstoreUsers";

const apiVersion: string = require("./package.json").version;
const endpoints: {
  path: string | string[];
  handler: string;
}[] = require("./endpoints.json");

async function start() {
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
        app.get(endpoint.path, module.default);
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

  const server = app.listen(3001, async () => {
    // @ts-ignore
    success(`Listening on port ${server.address().port}`);

    if (process.env.NODE_ENV === "production") {
      setInterval(updateTranslations, 5 * 1000 * 60);
      updateTranslations();

      //* Update usage
      setInterval(updateUsage, 60 * 60 * 1000);
      updateUsage();

      //* Response Time check
      setInterval(updateResponseTime, 5 * 60 * 1000);
      updateResponseTime();

      //* Update presences
      setInterval(updatePresences, 5 * 60 * 1000);
      updatePresences();
    }
  });
}

config();
start();

async function updateUsage() {
  const collection = MongoClient.db("PreMiD").collection("usage");
  await collection.findOneAndUpdate(
    { key: 0 },
    {
      $set: {
        chrome: await getWebstoreUsers("agjnjboanicjcpenljmaaigopkgdnihi")
      }
    }
  );
}

function updatePresences() {
  const startTimestamp = Date.now();
  const presenceUpdater = fork("util/functions/updatePresences.js");
  presenceUpdater.on("exit", code =>
    code === 0
      ? success(`Updated presences in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating presences")
  );
}

function updateTranslations() {
  const startTimestamp = Date.now();
  const translationsUpdater = fork("util/functions/updateTranslations.js");
  translationsUpdater.on("exit", code =>
    code === 0
      ? success(`Updated translations in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating translations")
  );
}

function updateResponseTime() {
  const startTimestamp = Date.now();
  const responseTimeUpdater = fork("./util/responseTime.js");
  responseTimeUpdater.on("exit", code =>
    code === 0
      ? success(`Updated response time in ${Date.now() - startTimestamp}ms`)
      : error("An error occurred while updating response time")
  );
}
