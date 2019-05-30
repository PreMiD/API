var request = require("request-promise-native");

/**
 * Get the usage data of an extension
 * @param {String} id Chrome webstore item id
 */
async function getWebstoreUsers(id) {
  return new Promise(function(resolve, reject) {
    request(
      `http://www.whateverorigin.org/get?url=${encodeURIComponent(
        `https://chrome.google.com/webstore/detail/background-image-for-goog/${id}`
      )}`
    ).then(res => {
      res = JSON.parse(res).contents;
      var str =
        "" +
        res.match(
          /<span class="e-f-ih" title="[0-9,]* users">[0-9,]* users<\/span>/
        );

      resolve(
        str
          .split('"')[3]
          .replace(" users", "")
          .replace(/[^\d.-]/g, "")
      );
    });
  });
}

module.exports = getWebstoreUsers;
