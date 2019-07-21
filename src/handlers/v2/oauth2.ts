import { MongoClient } from "../../db/client";
import { Response, Request } from "express";
import request from "request-promise-native";

export = async (req: Request, res: Response) => {
  if (typeof req.query.code === "undefined") {
    res.redirect("premid.app");
    return;
  }

  var base = "https://discordapp.com/api/";

  request({
    uri: `https://discordapp.com/api/oauth2/token`,
    form: {
      client_id: "503557087041683458",
      client_secret: "YXkpVhfrBj83uCkTCm6de0FKCVA0nr-U",
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: "http://localhost:3001/OAuth2/Discord",
      scope: "identify"
    },
    method: "POST",
    json: true
  })
    .then(credentials => {
      request({
        uri: `${base}users/@me`,
        headers: {
          Authorization: `${credentials.token_type} ${credentials.access_token}`
        },
        json: true
      })
        .then(user => {
          console.log(user);
        })
        .catch(_ => {});
    })
    .catch(_ => {});

  res.sendStatus(200);
};
