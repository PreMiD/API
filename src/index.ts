import "source-map-support/register";
import { config } from "dotenv";
config({ path: "../.env" });
import express from "express";
import debug from "./util/debug";
import { connect } from "./db/client";
import loadEndpoints from "./util/functions/loadEndpoints";
import updateResponseTime from "./util/functions/updateResponseTime";

//* Create express server
//* Disable x-powered-by HTTP header
//* Set API Headers
let server = express();
server.disable("x-powered-by");
server.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

connect()
  .then(() => {
    loadEndpoints(server, require("./endpoints.json"));
    server.listen(3001);

    if (process.env.NODE_ENV !== "production") return;
    //* Update response Time (StatusPage)
    updateResponseTime();
    setInterval(updateResponseTime, 5 * 60 * 1000);
  })
  .catch(err => debug("error", "index.ts", err.message));
