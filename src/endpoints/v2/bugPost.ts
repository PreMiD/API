import { cache } from "../../index";
import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";
import { getDiscordUser } from "../../util/functions/getDiscordUser";

let bugs = pmdDB.collection("bugs");
cache.onUpdate("bugs", data => (bugs = data));
let bugUsers = pmdDB.collection("bugUsers");
cache.onUpdate("bugUsers", data => (bugUsers = data));

//* Request Handler
const handler: RequestHandler = async (req, res) => {

	if (!req.body.brief) {
		return res.status(449).send({ error: 1, message: "No Bug brief providen." });
  }
    
  if (!req.body.description) {
    return res.status(449).send({ error: 2, message: "No Bug description providen." });
  }
  if (!req.params["token"]) {
    return res.status(401).send({ error: 3, message: "No token providen." });
	}

  getDiscordUser(req.params["token"])
    .then(async dUser => {

        await bugUsers.findOneAndUpdate(
          {userId:dUser.id},
          {$setOnInsert: {
            userId:dUser.id,
            total:0,
            count:3
            }},
          {upsert:true}
        )

        const result = await bugUsers.updateOne({userId:dUser.id, count: {$gt: 0}}, {$inc: {total: +1, count: -1}})
          
        if (result.modifiedCount === 0) return res.status(403).send('Too many active reports');

        await bugs.insertOne({
          brief:req.body.brief,
          system:req.body.system,
          description:req.body.description,
          status: req.body.status,
          date: req.body.date,
          userName:dUser.username+"#"+dUser.discriminator,
          userId:dUser.id
        })
        .then(result => res.sendStatus(200))
        .catch(err => res.sendStatus(401));
    })
    .catch(err => {
      res.sendStatus(401);
    })
};

//* Export handler
export { handler };
