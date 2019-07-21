import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

export = async (req: Request, res: Response) => {
  if (req.path.slice(req.path.length - 4, req.path.length) === "list") {
    var languageCodes = Array.from(
      new Set(
        (await MongoClient.db("PreMiD")
          .collection("langFiles")
          .find({ project: "extension" })
          .toArray()).map(row => row.lang)
      )
    );

    res.send(languageCodes);
    return;
  }

  if (req.params.project === "website") req.params.project = "website-v2";
  //* fetch versions from MongoDB
  var langFile = await MongoClient.db("PreMiD")
    .collection("langFiles")
    .findOne({ lang: req.params.lang, project: req.params.project });

  if (!langFile) {
    res.sendStatus(404);
    return;
  }

  //* Send response
  res.send(
    Object.assign(
      //@ts-ignore
      ...Object.keys(langFile.translations).map(lg => {
        return { [lg.replace(/[_]/g, ".")]: langFile.translations[lg] };
      })
    )
  );
};
