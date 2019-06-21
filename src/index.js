//* Load .env
require("dotenv").load();
require("./responseTime");

//* Import stuff
var express = require("express"),
  debug = require("./util/debug"),
  app = express(),
  pages = require("./pages.json");

//* Set API Headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//* Trim trailing slash
require("./util/slasher")(app);

//* Loading pages
debug.info(`Found ${pages.length} API endpoints`);

pages.forEach(page => {
  if (page.path instanceof Array)
    page.path.map(path =>
      app.get(`/${path}/`, require(`./pages/${page.file}`))
    );
  else app.get(`/${page.path}/`, require(`./pages/${page.file}`));
});

//* Return 404 on non existant paths
app.use(function(req, res) {
  //* Set headers
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ error: 404, message: "Not Found" }));
});

//* Update languages in database
require("./util/langUpdater")();
setInterval(require("./util/langUpdater"), 5 * 60 * 1000);

//* Update usage count
require("./util/usageUpdater")();
setInterval(require("./util/usageUpdater"), 15 * 60 * 1000);

if (process.env.NODE_ENV == "production") {
  //* Update presences in database
  require("./util/presenceUpdater")();
  setInterval(require("./util/presenceUpdater"), 5 * 60 * 1000);
}

//* Update presences in database
require("./util/translationUpdater")();
setInterval(require("./util/translationUpdater"), 5 * 60 * 1000);

var listener = app.listen(3001, function() {
  debug.success(`PreMiD API listening on port ${listener.address().port}!`);
});
