const request = require('request-promise-native'),
	fs = require('fs');

module.exports = async function update() {
	if (!await fs.existsSync('./languages')) await fs.mkdirSync('./languages');

	var langCodes = await Promise.all(
		(await poFetch('https://api.poeditor.com/v2/languages/list', {
			api_token: process.env.POEditorAPIKey,
			id: '217273'
		})).result.languages.map((lang) => lang.code)
	);

	langCodes.map(async (lCode) => {
		Promise.all(
			(await poFetch('https://api.poeditor.com/v2/terms/list', {
				api_token: process.env.POEditorAPIKey,
				id: '217273',
				language: lCode
			})).result.terms.map((term) => [ term.term, term.translation ])
		).then((translations) => {
			translations = translations.filter((t) => t[1].content != '' && t[1].fuzzy == 0).map((t) => {
				return { [t[0]]: t[1].content };
			});

			fs.writeFileSync(`./languages/${lCode}.json`, JSON.stringify(Object.assign({}, ...translations)));
		});
	});
};

function poFetch(url, data) {
	return request({
		url: url,
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		form: data,
		json: true
	});
}
