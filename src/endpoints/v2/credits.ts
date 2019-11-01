import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const credits = pmdDB.collection("credits");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
  //* user param not set
  if (!req.params["userId"]) {
    //* Send all users
    //* return
    res.send(await credits.find({}, { projection: { _id: false } }).toArray());
    return;
  }

  //* find user
  //* Return user if found
  //* Else return error
  const user = await credits.findOne(
    { userId: req.params["userId"] },
    { projection: { _id: false } }
  );
  if (user) res.send(user);
  else res.send({ error: 2, message: "User not found." });
};

//* Export handler
export { handler };
