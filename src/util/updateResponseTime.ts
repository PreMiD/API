import axios from "axios";
import debug from "./debug";

//* Get current time
//* Send request to API
const startTimestamp = Date.now();
axios.get("http://localhost:3001/ping").then(({ status }) => {
  //* Calc response time in ms
  //* exit if stauts != 200
  //* Send response time to StatusPage
  //* Show debug
  const responseTime = Date.now() - startTimestamp;
  if (status !== 200) process.exit();
  axios.post(
    `https://api.statuspage.io/v1/pages/${process.env.STATUSPAGE_PAGEID}/metrics/${process.env.STATUSPAGE_METRICID}/data`,
    {
      data: {
        timestamp: Math.floor(startTimestamp / 1000),
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
  debug(
    "info",
    "updateResponseTime.ts",
    `Updated response time: ${responseTime}ms`
  );
});
