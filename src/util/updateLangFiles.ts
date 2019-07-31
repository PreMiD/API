import axios from "axios";
import { MongoClient } from "../db/client";

var base = "https://www.transifex.com/api/2/";

export default async function() {
  await updateLanguages("extension");
  await updateLanguages("website-v2");
}

async function updateLanguages(project: string) {
  var res = await transiQuest(`project/${project}/languages/`);

  var languageCodes: Array<String> = res.map(lang => lang.language_code);
  languageCodes.push("en");

  var res = (await axios.get(
    `https://api.transifex.com/organizations/PreMiD/projects/${project}/resources/`,
    {
      auth: {
        username: "api",
        password: process.env.TRANSIFEX_API_TOKEN
      }
    }
  )).data;

  var resourceSlugs = res.map(resource => resource.slug);

  Promise.all(
    languageCodes.map(async lang => {
      return {
        translations: Object.assign(
          // @ts-ignore
          ...(await Promise.all(
            resourceSlugs.map(async slug => {
              var sLang = JSON.parse(
                (await transiQuest(
                  `project/${project}/resource/${slug}/translation/${lang}/`
                )).content
              );

              return Object.assign(
                //@ts-ignore
                ...Object.keys(sLang).map(lg => {
                  sLang[lg] = sLang[lg].message;
                  return { [lg.replace(/[.]/g, "_")]: sLang[lg] };
                })
              );
            })
          ))
        ),
        lang: lang,
        project: project
      };
    })
  ).then(async slugs => {
    var db = MongoClient.db("PreMiD"),
      coll = db.collection("langFiles");

    slugs.map(async slug => {
      //@ts-ignore
      var res = await coll.findOneAndReplace(
        { lang: slug.lang, project: project },
        slug
      );
      if (!res.lastErrorObject.updatedExisting) await coll.insertOne(slug);
    });
  });
}

function transiQuest(path: string) {
  return new Promise<any>((resolve, reject) => {
    axios
      .get(path, {
        baseURL: base,
        auth: {
          username: "api",
          password: process.env.TRANSIFEX_API_TOKEN
        }
      })
      .then(res => resolve(res.data))
      .catch(reject);
  });
}
