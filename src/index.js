//* Load .env
require('dotenv').load();

//* Import stuff
var express = require('express'),
	debug = require('./util/debug'),
	app = express(),
	pages = require('./pages.json');

//* Disallow direct access when using proxy
if (process.env.proxySecure == 'true') {
	var AccessControl = require('express-ip-access-control');
	var options = {
		mode: 'allow',
		allows: process.env.proxySecureIp.split(','),
		log: function(clientIp, access) {
			debug.info(clientIp + (access ? ' accessed.' : ' denied.'));
		},
		statusCode: 401,
		message: 'Unauthorized'
	};
	app.use(AccessControl(options));
}

//* Set API Headers
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

//* Loading pages
debug.info(`Found ${pages.length} API endpoints`);
pages.forEach((page) => {
	app.get(`/${page.path}`, require(`./pages/${page.file}`));
});

//* Update languages in database
require('./util/langUpdater');
setInterval(require('./util/langUpdater'), 5 * 60 * 1000);

app.listen(3001, function() {
	debug.success('PreMiD API listening on port 3001!');
});
