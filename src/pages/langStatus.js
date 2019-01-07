//* Require stuff
var { query } = require("../database/functions")
var Canvas = require('canvas')

Canvas.registerFont('./fonts/Roboto/Roboto-Bold.ttf', {family: "Roboto", weight: "700"})

//* Define height & width
var height = 20,
width = 55

//* Create Canvas
var canvas = Canvas.createCanvas(width, height)

async function get(req, res) {
  if(req.params.lang != undefined) {
    var rows = (await query('SELECT percentage FROM languages WHERE code = ?', [req.params.lang])).rows

    if(rows.length != 0) {
      var percentage = rows[0].percentage
  
      var ctx = canvas.getContext('2d')
      
      ctx.font = '700 13px Roboto'
      ctx.textBaseline = "middle";
      
      ctx.fillStyle = hsl_col_perc(percentage, 0, 120);
      roundRect(ctx, 0, 0, width, height, 5, true)
      
      ctx.fillStyle = "black"
      ctx.textAlign = "center"
      ctx.fillText(`${percentage}%`, width/2, height/2)
      
      res.setHeader('Content-Type', 'image/png');
      canvas.createPNGStream().pipe(res);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({error: "provided lang code is not valid."}));
    }
  } else {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({error: "lang is not set."}));
  }
}

//* Export function
module.exports = get;



/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
  	ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.stroke();
  }

}


function hsl_col_perc(percent, start, end) {
  var a = percent / 100,
      b = (end - start) * a,
      c = b + start;

  // Return a CSS HSL string
  return 'hsl('+c+', 100%, 50%)';
}