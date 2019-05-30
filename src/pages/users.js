//* Require stuff
var { query } = require("../database/functions");

async function get(req, res) {
  res.setHeader("Content-Type", "application/json");

  var rows = (await query("SELECT chrome FROM userCounts")).rows;

  res.send(JSON.stringify(rows[0]));
}

//* Export function
module.exports = get;
