async function get(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(await require('fs').readFileSync('./updates.json'));
}
module.exports = get;
