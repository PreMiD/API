import { Response, Request } from "express";

export const handler = async (req: Request, res: Response) => {
  if (req.params.os == "windows.exe") {
    if (req.params.bit == "32bit")
      res.download("./handlers/v1/data/update_32bit.exe");
    else res.download("./handlers/v1/data/update_64bit.exe");
    return;
  }
  if (req.params.os == "macos.app") {
    res.download("./handlers/v1/data/update.app.tgz");
    return;
  }

  res.setHeader("Content-Type", "text/xml");
  if (req.params.bit == "32bit")
    res.send(
      await require("fs").readFileSync("./handlers/v1/data/updateApp_32bit.xml")
    );
  else
    res.send(
      await require("fs").readFileSync("./handlers/v1/data/updateApp_64bit.xml")
    );
};
