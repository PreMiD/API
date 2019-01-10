const express = require('express')
const app = express()
var mysql = require('mysql')
var utf8 = require('utf8')
require('dotenv').load();

var con = mysql.createConnection({
  host: "localhost",
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: 'premid'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
})

function query(...data) {
  return new Promise((resolve, reject) => {
      con.query(...data, (err, rows, fields, result) => {
          if (err) return reject(err);
          resolve({ rows, fields, result });
      });
  }).catch(err => console.log("Error while querying + " + err))
}

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

//* API endpoints
app.get('/credits', require('./pages/credits'))
app.get('/getServices', require('./pages/getServices'))
app.get('/langStatus/:lang', require('./pages/langStatus'))
app.get('/credit/:id', require('./pages/credit'))

require('./util/langUpdater').run()
setInterval(require('./util/langUpdater').run, 5*60*1000)

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})