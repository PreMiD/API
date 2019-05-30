var getWebstoreUsers = require("../util/functions/getWebstoreUsers"),
  { query } = require("../database/functions");

module.exports = async () => {
  query(
    "UPDATE userCounts SET chrome=?",
    parseInt(await getWebstoreUsers("agjnjboanicjcpenljmaaigopkgdnihi"))
  );
};
