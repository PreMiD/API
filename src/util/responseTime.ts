import request from "request";
import { info } from "./debug";

export default function() {
  var responseTime = Date.now();

  request("http://localhost:3001/ping", function(error, res, body) {
    //* If some error happens
    if (error || res.statusCode !== 200) return;

    //* Calc response time in ms
    responseTime = Date.now() - responseTime;
    info(`Last response time was: ${responseTime}ms`);

    request({
      uri: `https://api.statuspage.io/v1/pages/${
        process.env.STATUSPAGE_PAGEID
      }/metrics/${process.env.STATUSPAGE_METRICID}/data`,
      headers: {
        Authorization: `OAuth ${process.env.STATUSPAGE_APIKEY}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      json: {
        data: {
          timestamp: Math.floor(Date.now() / 1000),
          value: responseTime
        }
      }
    });
  });
}
