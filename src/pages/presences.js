//* Require stuff
var { query } = require('../database/functions');

async function get(req, res) {
	res.setHeader('Content-Type', 'application/json');

	if (req.params.presence == undefined) {
		res.send(JSON.stringify((await query('SELECT url, name FROM presences')).rows));
		return;
	}

	var rows = (await query('SELECT url, name FROM presences WHERE name = ?', req.params.presence)).rows;

	if (rows.length == 0) {
		res.send(JSON.stringify({ error: 406, message: 'Presence not found.' }));
		return;
	}

	res.send(JSON.stringify(rows[0]));
}

//* Export function
module.exports = get;
