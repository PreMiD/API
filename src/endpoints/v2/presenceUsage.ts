import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

//* Request Handler
const handler: RequestHandler = async (_req, res) => {
  let ranking = {};

  [].concat
    .apply(
      [],
      (
        await science
          .find({}, { projection: { _id: false, presences: true } })
          .toArray()
      ).map(p => p.presences)
    )
    .map(function(x: string) {
      ranking[x] = (ranking[x] || 0) + 1;
    });

  res.send(ranking);
};

//* Export handler
export { handler };
