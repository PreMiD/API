import { cache } from "../../index";
import { RequestHandler } from "express";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

//* Define bugUserInfo collection
let bug = cache.get("bugUsers");
cache.onUpdate("bugUsers", (data) => (bug = data));

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
      //* Else return default 3
      const info = bug.find((b) => b.userId === dUser.id);
      if (info === undefined || info === "" || !info) res.send(null);
      else res.send(info);
    })
    .catch((err) => {
      res.sendStatus(401);
    });
};

//* Export handler
export { handler };
