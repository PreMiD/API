import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const betaAccess = pmdDB.collection("betaAccess");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  //* userId not providen
  if (!req.params["userId"]) {
    //* send error
    //* return
    res.send({ error: 1, message: "No userId providen." });
    return;
  }

  //* Find user in db
  //* Send response
  const user = await betaAccess.findOne(
    { userId: req.params["userId"] },
    { projection: { _id: false, keysLeft: false } }
  );
  res.send({ userId: req.params["userId"], access: user ? true : false });
};

//* Export handler
export { handler };
