import axios from "axios";
import { MongoClient } from "../../db/client";

export default async function() {
  var coll = MongoClient.db("PreMiD").collection("presences");
  var availablePresences = await coll.find().toArray();

  var contents = (await axios.get(
    "https://api.github.com/repos/PreMiD/Presences/contents/",
    {
      headers: { "User-Agent": "PreMiD" }
    }
  )).data;

  contents = contents
    .filter(c => c.type == "dir")
    .filter(dir => !dir.name.startsWith("."));

  Promise.all(
    contents.map(async dir => {
      var metadata = (await axios.get(
        `https://api.github.com/repos/PreMiD/Presences/contents/${
          dir.name
        }/metadata.json`,
        {
          headers: { "User-Agent": "PreMiD" }
        }
      )).data;

      return [
        JSON.parse(Buffer.from(metadata.content, "base64").toString()).service,
        dir.path
      ];
    })
  ).then(async results => {
    availablePresences = await Promise.all(availablePresences.map(f => f.name));

    var remainPresences = results.filter(
      f => !availablePresences.includes(f[0])
    );

    remainPresences.map(async pre => {
      coll.insertOne({
        name: pre[0],
        url: `https://raw.githubusercontent.com/PreMiD/Presences/master/${
          pre[1]
        }/`
      });
    });
  });
}
