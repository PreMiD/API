import request from "request-promise-native";

/**
 * Get the usage data of an extension
 * @param {String} id Chrome webstore item id
 */
export default function getWebstoreUsers(id: string) {
  return new Promise<number>(function(resolve, _reject) {
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
        parseInt(
          str
            .split('"')[3]
            .replace(" users", "")
            .replace(/[^\d.-]/g, "")
        )
      );
    });
  });
}
