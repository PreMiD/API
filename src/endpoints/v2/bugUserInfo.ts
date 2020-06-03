import { RequestHandler } from "express";
import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";

//* Define bugUserInfo collection
let bugs = Array();

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  //* userId not providen
  if (!req.params["token"]) {
    //* send error
    //* return
    res.send({ error: 1, message: "No token providen." });
    return;
  }

  getDiscordUser(req.params["token"])
    .then(async (dUser) => {
      //* find user
      //* Return user if found
      // @ts-ignore
      bugs = await pmdDB
        .collection("bugs")
        .find(
          { userId: dUser.id, status: "New" },
          { projection: { _id: false } }
        )
        .toArray();
      if (bugs === undefined || !bugs) res.send({ count: 3 });
      else res.send({ count: 3 - bugs.length, bugs: bugs });
    })
    .catch((err) => {
      res.sendStatus(500);
    });
};

//* Export handler
export { handler };
