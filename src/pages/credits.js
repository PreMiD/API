//* Require stuff
var { query } = require('../database/functions'),
	utf8 = require('utf8');

async function get(req, res) {
	if (req.params.userID != '') {
		var result = await query('SELECT * FROM credits WHERE userID = ?', req.params.userID);
		//* Set headers
		res.setHeader('Content-Type', 'application/json');
		res.send(
			JSON.stringify({
				userID: result.rows[0].userID,
				name: utf8.decode(result.rows[0].name),
				tag: result.rows[0].tag,
				avatar: result.rows[0].avatarURL,
				role: result.rows[0].type,
				rolePosition: result.rows[0].position,
				roleColor: result.rows[0].color,
				patronColor: result.rows[0].patronColor == '#000000' ? '#fff' : result.rows[0].patronColor,
				roles: result.rows[0].roles.split(',')
			})
		);
		return;
	}
	//* Get credits from db & I (Timeraa ) am the creator so i should be shown first
	var result = await query(`SELECT * FROM credits ORDER BY position DESC, userID="223238938716798978" DESC`),
		resultArray = [];

	//* build result array for JSON object
	result.rows.map((row) => {
		resultArray.push({
			userID: row.userID,
			name: utf8.decode(row.name),
			tag: row.tag,
			avatar: row.avatarURL,
			role: row.type,
			rolePosition: row.position,
			roleColor: row.color,
			patronColor: row.patronColor == '#000000' ? '#fff' : row.patronColor,
			roles: row.roles.split(',')
		});
	});

	//* Set headers
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(resultArray));
}

//* Export function
module.exports = get;
