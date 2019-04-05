//* Require stuff
var { query } = require('../database/functions');

async function get(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify((await query('SELECT url, name FROM presences')).rows));
}

//* Export function
module.exports = get;
