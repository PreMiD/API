import axios from "axios";
import { connect, MongoClient } from "../db/client";
import { error } from "./debug";

connect("PreMiD API - Translation Updater").then(run);

async function run() {
  const startTimestamp = Date.now();

  try {
    const response = await axios.get<string>("http://localhost:3001/ping");

    //* If some error happens
    if (response.status !== 200) {
      throw new Error(`Http status response: ${response.status}`);
    }

    const timestamp = Date.now();
    //* Calc response time in ms
    const responseTime = timestamp - startTimestamp;

    await axios.post(
      `https://api.statuspage.io/v1/pages/${process.env.STATUSPAGE_PAGEID}/metrics/${process.env.STATUSPAGE_METRICID}/data`,
      {
        data: {
          timestamp: Math.floor(timestamp / 1000),
          value: responseTime
        }
      },
      {
        headers: {
          Authorization: `OAuth ${process.env.STATUSPAGE_APIKEY}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    error(err.message);
    process.exit(1);
  }

  await MongoClient.close();
}
