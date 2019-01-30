//* Require stuff
const fetch = require("node-fetch");
var { query } = require("../database/functions")

module.exports = async function() {
  var dbLanguages = (await query('SELECT code FROM languages')).rows

  fetch("https://api.poeditor.com/v2/languages/list", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `api_token=${process.env.POEditorAPIKey}&id=217273`
  })
  .then(res => res.json())
  .then(json => {
    json.result.languages.forEach(language => {
      if(dbLanguages.find(dblang => language.code)) {
        query(`UPDATE languages SET translations = ?, percentage = ?, updated = ? WHERE code = ?`, [language.translations, language.percentage, language.updated, language.code])
      } else {
        query(`INSERT INTO languages (${Object.keys(language).join(", ")}) VALUES ('${Object.values(language).join("', '")}')`)
      }
    })
  })
}