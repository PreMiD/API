//* Require stuff
var { query } = require('../database/functions'),
	canvas = require('canvas'),
	roundRect = require('../util/functions/roundRect'),
	hsl_col_perc = require('../util/functions/hsl_col_perc'),
	height = 20,
	width = 55;

canvas.registerFont('./fonts/Inter/Inter-Bold.ttf', { family: 'Inter', weight: '700' });

//* Create canvas
var canvas = canvas.createCanvas(width, height);

async function get(req, res) {
	if (req.params.lang != undefined) {
		var rows = (await query('SELECT percentage FROM languages WHERE code = ?', [ req.params.lang ])).rows;

		if (rows.length > 0) {
			var percentage = rows[0].percentage,
				ctx = canvas.getContext('2d');

			//* Default Font settings
			ctx.font = '700 13px Inter';
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'center';

			//* Color Background
			ctx.fillStyle = hsl_col_perc(percentage, 0, 120);
			roundRect(ctx, 0, 0, width, height, 5, true);

			//* Black Text
			ctx.fillStyle = 'black';
			ctx.fillText(`${percentage}%`, width / 2, height / 2);

			//* Set image header
			res.setHeader('Content-Type', 'image/png');
			canvas.createPNGStream().pipe(res);
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ error: 406, message: 'Provided language code is not valid.' }));
		}
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ error: 405, message: 'No language code provided.' }));
	}
}

//* Export function
module.exports = get;
