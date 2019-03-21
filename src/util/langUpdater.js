//* Require stuff
var request = require('request-promise-native'),
	{ query } = require('../database/functions');

module.exports = async function() {
	var dbLanguages = (await query('SELECT code FROM languages')).rows,
		res = await request('https://api.poeditor.com/v2/languages/list', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: `api_token=${process.env.POEditorAPIKey}&id=217273`,
			json: true
		});

	//* If POEditor API != return code 200 return
	if (res.response.code !== '200') return;

	//* Loop through all languages in the project
	res.result.languages.map((lang) => {
		//* Language code exists in db
		if (dbLanguages.find((dbLang) => dbLang.code == lang.code)) {
			//* Update language
			query(`UPDATE languages SET translations = ?, percentage = ?, updated = ? WHERE code = ?`, [
				lang.translations,
				lang.percentage,
				lang.updated,
				lang.code
			]);
		} else {
			//* Insert language
			query(
				`INSERT INTO languages (${Object.keys(lang).join(', ')}) VALUES ('${Object.values(lang).join("', '")}')`
			);
		}
	});
};
