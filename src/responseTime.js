var request = require("request");

var responseTime = 0;

updateResponse();
setInterval(updateResponse, 5 * 1000 * 60);

function updateResponse() {
  responseTime = Date.now();
  request("https://api.premid.app/", function(err, res, body) {
    if (err) return;
    responseTime = Date.now() - responseTime;

    request(
      {
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
      },
      function(err, res, body) {
        console.log(res.body);
      }
    );
  });
}
