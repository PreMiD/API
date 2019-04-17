//* Require stuff
var fs = require('fs');

async function get(req, res) {
	if (req.params.langCode == undefined) {
		res.send(JSON.stringify({ error: 405, message: 'No language code provided.' }));
		return;
	}

	if (!await fs.existsSync(`./languages/${req.params.langCode}.json`)) {
		res.send(JSON.stringify({ error: 408, message: 'Language file not found.' }));
		return;
	}

	//* Set headers
	res.setHeader('Content-Type', 'application/json');
	res.send(await fs.readFileSync(`./languages/${req.params.langCode}.json`));
}

//* Export function
module.exports = get;
