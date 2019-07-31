import axios from "axios";

/**
 * Get the usage data of an extension
 * @param {String} id Chrome webstore item id
 */
export default function(id: string) {
  return new Promise<number>(function(resolve, _reject) {
    axios
      .get(
        `http://www.whateverorigin.org/get?url=${encodeURIComponent(
          `https://chrome.google.com/webstore/detail/premid/${id}`
        )}`
      )
      .then(({ data }) => {
        data = data.contents;
        var str =
          "" +
          data.match(
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
