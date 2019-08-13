import Octokit from "@octokit/rest";
import Axios from "axios";
import ts from "typescript";
import { writeFileSync, readFileSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { MongoClient } from "../../db/client";
import { extname } from "path";

const octokit = new Octokit({ auth: process.env.PRESENCEUPDATERTOKEN });

export default async function updatePresences() {
  var coll = MongoClient.db("PreMiD").collection("presences");

  await ensureDirSync("tmp");

  Promise.all<any>(
    (await octokit.repos.getContents({
      owner: "PreMiD",
      repo: "Presences",
      path: "/"
    })).data
      .filter(
        d =>
          d.type === "dir" && !d.name.startsWith(".") && !d.name.startsWith("@")
      )
      .map(async f => {
        var metadata = (await Axios.get(
            `https://raw.githubusercontent.com/PreMiD/Presences/master/${
              f.name
            }/dist/metadata.json`
          )).data,
          presenceTs = true,
          presence,
          iframeTs = true,
          iframe;

        await Promise.resolve(
          Axios.get(
            `https://raw.githubusercontent.com/PreMiD/Presences/master/${
              f.name
            }/presence.ts`
          )
            .then(res => (presence = res.data))
            .catch(async () => {
              presenceTs = false;
              presence = (await Axios.get(
                `https://raw.githubusercontent.com/PreMiD/Presences/master/${
                  f.name
                }/dist/presence.js`
              )).data;
            })
        );

        if (typeof metadata.iframe !== "undefined" && metadata.iframe)
          await Promise.resolve(
            Axios.get(
              `https://raw.githubusercontent.com/PreMiD/Presences/master/${
                f.name
              }/iframe.ts`
            )
              .then(res => (iframe = res.data))
              .catch(async () => {
                iframeTs = false;
                iframe = (await Axios.get(
                  `https://raw.githubusercontent.com/PreMiD/Presences/master/${
                    f.name
                  }/dist/iframe.js`
                )).data;
              })
          );

        await ensureDirSync(`tmp/${f.name}`);
        await writeFileSync(
          `tmp/${f.name}/metadata.json`,
          JSON.stringify(metadata)
        );
        await writeFileSync(
          `tmp/${f.name}/presence.${presenceTs ? "ts" : "js"}`,
          presence
        );

        var rs = [`tmp/${f.name}/presence.${presenceTs ? "ts" : "js"}`];
        if (typeof metadata.iframe !== "undefined" && metadata.iframe) {
          await writeFileSync(
            `tmp/${f.name}/iframe.${iframeTs ? "ts" : "js"}`,
            iframe
          );
          rs.push(`tmp/${f.name}/iframe.${iframeTs ? "ts" : "js"}`);
        }

        rs.push(metadata);

        return rs;
      })
  ).then(results => {
    var rs = results.concat.apply([], results);

    let program = ts.createProgram({
      rootNames: rs.filter(f => typeof f === "string" && f.endsWith("ts")),
      options: { removeComments: true }
    });
    program.emit();

    results.map(async d => {
      var presence = (await readFileSync(
        d[0].replace(extname(d[0]), ".js"),
        "utf-8"
      ))
        .replace(/\s\s+/g, "")
        .replace(/\n/g, "")
        .trim();
      if (d.length === 3)
        var iframe = (await readFileSync(
          d[1].replace(extname(d[1]), ".js"),
          "utf-8"
        ))
          .replace(/\s\s+/g, "")
          .replace(/\n/g, "")
          .trim();
      var metadata = d[d.length - 1];

      var pres = await coll.findOne({ name: metadata.service }),
        query = { metadata: metadata, presenceJs: presence };

      //@ts-ignore
      if (typeof iframe !== "undefined") query.iframeJs = iframe;

      if (pres) {
        coll.findOneAndUpdate({ name: metadata.service }, { $set: query });
      } else {
        // @ts-ignore
        query.name = metadata.service;
        // @ts-ignore
        query.url = `https://api.premid.app/v2/presences/${
          metadata.service
        }/f/`;
        coll.insertOne(query);
      }
    });

    //* Filter and delete old ones
    coll
      .find()
      .toArray()
      .then(presences => {
        presences
          .map(presence => presence.name)
          .filter(p => !results.find(rs => rs[rs.length - 1].service === p))
          .map(p => {
            coll.findOneAndDelete({ name: p });
          });
      });
  });
}
