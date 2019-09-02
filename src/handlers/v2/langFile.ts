import { RequestHandler } from "express";
import { MongoClient } from "../../db/client";
import { LangFile } from "../../db/types";

const handler: RequestHandler = async (req, res) => {
  const database = MongoClient.db("PreMiD");
  const langFilesCollection = database.collection<LangFile>("langFiles");

  if (req.path === "/v2/langFile/list") {
    const extensionProjectTranslations = await langFilesCollection
      .find(
        {
          project: "extension",
        },
        {
          projection: {
            _id: false,
            project: false,
            translations: false,
          },
        }
      )
      .toArray();
    const languageCodes = extensionProjectTranslations.map(
      langFile => langFile.lang,
    );

    res.send(languageCodes);
    return;
  }

  const langFile = await langFilesCollection.findOne({
    lang: req.params.lang,
    project: req.params.project,
  });

  if (!langFile) {
    res.sendStatus(404);
    return;
  }

  const object = Object.assign(
    {},
    ...Object.keys(langFile.translations).map(translationKey => {
      const newKey = translationKey.replace(/[_]/g, ".");
      return {
        [newKey]: langFile.translations[translationKey],
      };
    })
  );

  res.send(object);
};

export { handler };
