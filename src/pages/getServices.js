//* Require stuff
var {query} = require('../database/functions')

async function get(req, res) {  
  //* Set headers
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify((await query("SELECT * FROM presences")).rows));
}

//* Export function
module.exports = get