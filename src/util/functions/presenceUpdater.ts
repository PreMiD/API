import axios from "axios";
import { MongoClient } from "../../db/client";

export default async function() {
  var coll = MongoClient.db("PreMiD").collection("presences");

  axios
    .get("https://api.github.com/repos/PreMiD/Presences/contents/", {
      headers: {
        "User-Agent": "PreMiD"
      }
    })
    .then(res => {
      var contents = res.data;

      contents = contents
        .filter(c => c.type == "dir")
        .filter(dir => !dir.name.startsWith("."));

      Promise.all(
        contents.map(async dir => {
          var metadata = (await axios.get(
            `https://api.github.com/repos/PreMiD/Presences/contents/${
              dir.name
            }/dist/metadata.json`,
            {
              headers: {
                "User-Agent": "PreMiD"
              }
            }
          )).data;

          return [
            JSON.parse(Buffer.from(metadata.content, "base64").toString()),
            dir.path
          ];
        })
      ).then(results => {
        results.map(async r => {
          if (await coll.findOne({ name: r[0].service }))
            coll.updateOne(
              { name: r[0].service },
              {
                $set: {
                  metadata: r[0],
                  url: `https://raw.githubusercontent.com/PreMiD/Presences/master/${
                    r[1]
                  }/dist/`
                }
              }
            );
          else
            coll.insertOne({
              name: r[0].service,
              metadata: r[0],
              url: `https://raw.githubusercontent.com/PreMiD/Presences/master/${
                r[1]
              }/dist/`
            });
        });
      });
    })
    .catch(_ => {});
}
