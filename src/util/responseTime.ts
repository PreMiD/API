import axios from "axios";
import { info } from "./debug";

export default function() {
  var responseTime = Date.now();

  axios
    .get("http://localhost:3001/ping")
    .then(res => {
      //* If some error happens
      if (res.status !== 200) return;

      //* Calc response time in ms
      responseTime = Date.now() - responseTime;
      info(`Last response time was: ${responseTime}ms`);

      axios.post(
        `https://api.statuspage.io/v1/pages/${
          process.env.STATUSPAGE_PAGEID
        }/metrics/${process.env.STATUSPAGE_METRICID}/data`,
        {
          data: {
            timestamp: Math.floor(Date.now() / 1000),
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
    })
    .catch(err => console.log(err));
}
