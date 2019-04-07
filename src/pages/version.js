//* Require stuff
var { query } = require('../database/functions');

async function get(req, res) {
	var { extension, app } = (await query('SELECT * FROM versions')).rows[0];

	//* Set headers
	res.setHeader('Content-Type', 'application/json');
	//TODO Add small "scraper" to get and save newest version
	res.send({
		api: require('../package.json').version,
		app: app,
		extension: extension
	});
}

//* Export function
module.exports = get;
