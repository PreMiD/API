var request = require('request-promise-native'),
	{ query } = require('../database/functions');

module.exports = async function() {
	var availablePresences = (await query('SELECT name FROM presences')).rows;

	var contents = await request({
		url: 'https://api.github.com/repos/PreMiD/Presences/contents/',
		headers: { 'User-Agent': 'PreMiD', Authorization: 'token 2dfb13ce1aef97a486f68caea63762a18595adea' },
		json: true
	});

	contents = contents.filter((c) => c.type == 'dir');

	Promise.all(
		contents.map(async (dir) => {
			var metadata = await request({
				url: `https://api.github.com/repos/PreMiD/Presences/contents/${dir.name}/metadata.json`,
				headers: { 'User-Agent': 'PreMiD', Authorization: 'token 2dfb13ce1aef97a486f68caea63762a18595adea' },
				json: true
			});

			return [ JSON.parse(Buffer.from(metadata.content, 'base64').toString()).service, dir.path ];
		})
	).then(async (results) => {
		availablePresences = await Promise.all(availablePresences.map((f) => f.name));

		var remainPresences = results.filter((f) => !availablePresences.includes(f[0]));

		remainPresences.map(async (pre) => {
			await query('INSERT INTO presences (name, url) VALUES (?, ?)', [
				pre[0],
				`https://raw.githubusercontent.com/PreMiD/Presences/master/${pre[1]}/`
			]);
		});
	});
};
