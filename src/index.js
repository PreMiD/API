//* Load .env
require('dotenv').load()

//* Import stuff
var express = require('express'),
  app = express()

//* Disallow direct access when using proxy
if(process.env.proxySecure == "true"){
	var AccessControl = require('express-ip-access-control');
	var options = {
	    mode: 'allow',
	    allows: process.env.proxySecureIp.split(','),
	    log: function(clientIp, access) {
	        console.log(clientIp + (access ? ' accessed.' : ' denied.'));
	    },
	    statusCode: 401,
	    message: 'Unauthorized'
	};
	app.use(AccessControl(options));
}

//* Set API Headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/credits', require('./pages/credits'))
app.get('/getServices', require('./pages/getServices'))
app.get('/langStatus/:lang', require('./pages/langStatus'))
app.get('/credit/:id', require('./pages/credit'))
app.get('/response', require('./pages/response'))


//* Update languages in database
require('./util/langUpdater')
setInterval(require('./util/langUpdater'), 5*60*1000)

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})