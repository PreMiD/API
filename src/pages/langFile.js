//* Require stuff
var fs = require("fs");

async function get(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.params.langCode == undefined) {
    res.send(
      JSON.stringify({ error: 405, message: "No language code provided." })
    );
    return;
  } else if (req.params.langCode.toLowerCase() == "list") {
    res.send(
      (await fs.readdirSync("./languages/")).map(l => l.split(".json")[0])
    );
  }

  if (!(await fs.existsSync(`./languages/${req.params.langCode}.json`))) {
    res.send(
      JSON.stringify({ error: 408, message: "Language file not found." })
    );
    return;
  }

  //* Set headers
  res.send(await fs.readFileSync(`./languages/${req.params.langCode}.json`));
}

//* Export function
module.exports = get;
