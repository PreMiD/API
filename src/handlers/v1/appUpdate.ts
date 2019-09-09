import { Response, Request } from "express";
import { parseStringPromise, Builder } from "xml2js";
import { readFileSync } from "fs";
import { MongoClient } from "../../db/client";

export const handler = async (req: Request, res: Response) => {
  var xml = await parseStringPromise(
    readFileSync("./handlers/v1/data/updateApp.xml")
  );

  if (!["32bit", "64bit"].includes(req.params.bit)) res.sendStatus(404);

  xml.installerInformation.downloadLocationList[0].downloadLocation[0].url[0] = xml.installerInformation.downloadLocationList[0].downloadLocation[0].url[0].replace(
    "/BIT/",
    `/${req.params.bit}/`
  );

  if (
    ["2.0.4", "2.0-BETA3"].includes(
      (await MongoClient.db("PreMiD")
        .collection("usage")
        .findOne({ key: 1 })).version
    )
  ) {
    xml.installerInformation.versionId[0] = "0202";
    xml.installerInformation.version[0] = "2.0.2";
  }

  var builder = new Builder();

  res.setHeader("Content-Type", "text/xml");
  res.send(builder.buildObject(xml));
};
