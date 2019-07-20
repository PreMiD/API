import { MongoClient } from "../../db/client";
import { Response, Request } from "express";

export = async (req: Request, res: Response) => {
  //* fetch versions from MongoDB
  var langFile = await MongoClient.db("PreMiD")
    .collection("langFiles")
    .findOne({ lang: req.params.lang, project: "extension" });

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
