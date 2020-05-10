import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

const coll = pmdDB.collection("bugs");
const coll2 = pmdDB.collection("bugUsers");

//* Request Handler
const handler: RequestHandler = async (req, res) => {

	if (!req.body.brief) {
		return res.send({ error: 2, message: "No Bug brief providen." });
  }
    
  if (!req.body.description) {
    return res.send({ error: 2, message: "No Bug description providen." });
	}


  await coll2.findOneAndUpdate(
    {userId:req.body.userId},
    {$setOnInsert: {
      userId:req.body.userId,
      total:0,
      count:3
      }},
    {upsert:true}
  )

  const result = await coll2.updateOne({userId:req.body.userId, count: {$gt: 0}}, {$inc: {total: +1, count: -1}})
    
  if (result.modifiedCount === 0) return res.status(403).send('Too many active reports');

  console.log(result)

  coll.insertOne({
    brief:req.body.brief,
    description:req.body.description,
    status: req.body.status,
    date: req.body.date,
    userName:req.body.userName,
    userId:req.body.userId
  });
};

//* Export handler
export { handler };
