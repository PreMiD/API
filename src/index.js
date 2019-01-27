//* Load .env
require('dotenv').load()

//* Import stuff
var express = require('express'),
  app = express(),
  fs = require('fs'),
  pages = fs.readdirSync('./pages')

//* Set API Headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//* API endpoints
pages.map(p => {
  p = p.replace('.js', '')
  app.get(`/${p}`, require(`./pages/${p}`))
})

//* Update languages in database
require('./util/langUpdater')
setInterval(require('./util/langUpdater'), 5*60*1000)

//* Listen to port 8080
app.listen(8080, function () {
  console.log('PreMiD-API listening on port 8080!')
})