//* Require stuff
var fs = require("fs"),
  { query } = require("../database/functions");

async function get(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.params.userId == undefined) {
    res.send(JSON.stringify({ error: 410, message: "No user id provided." }));
    return;
  }

  var betaAccess = await query(
    "SELECT userId FROM betaAccess WHERE userId = ?",
    req.params.userId
  );

  if (betaAccess.rows.length > 0) res.send({ access: true });
  else res.send({ access: false });
}

//* Export function
module.exports = get;
