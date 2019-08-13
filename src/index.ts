import { connect, MongoClient } from "./db/client";
import { config } from "dotenv";
import express from "express";
import { success, error } from "./util/debug";
import updateLangFiles from "./util/updateLangFiles";
import getWebstoreUsers from "./util/functions/getWebstoreUsers";
import responseTime from "./util/responseTime";
import updatePresences from "./util/functions/updatePresences";

config();

var app = express();
//* Set API Headers
app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("API-Version", "2.0");
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
    success(`PreMiD API listening on port ${server.address().port}!`);

    if (process.env.NODE_ENV === "production") {
      setInterval(updateLangFiles, 15 * 1000 * 60);
      updateLangFiles();

      //* Update usage
      updateUsage();
      setInterval(updateUsage, 60 * 60 * 1000);

      //* Response Time check
      setInterval(responseTime, 5 * 60 * 1000);

      //* Update presences
      updatePresences();
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
