//* Improt stuff
var mysql = require('mysql'),
	debug = require('../util/debug'),
	db;

/**
 * Create database connection
 * @returns dbConnection
 */
function connectDatabase() {
	//* If db connection return dbConnection
	if (db) return db;

	//* Attempt connection to database
	//! localhost -> premid.app if development instance
	db = mysql.createConnection({
		host: process.env.NODE_ENV == 'dev' ? 'premid.app' : 'localhost',
		user: process.env.dbUser,
		password: process.env.dbPassword,
		database: 'premid'
	});

	//* When connected give debug
	db.connect(function(err) {
		if (err) throw err;
		debug.success('Connected to PreMiD database!');
	});

	//* Catch Database conneciton loss and reconnect instead of crashing
	db.on('error', function(err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			connectDatabase();
			debug.error('DB connection closed.');
		} else throw err;
	});

	return db;
}

//* Export file as function
module.exports = connectDatabase();
