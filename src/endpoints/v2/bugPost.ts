import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

const coll = pmdDB.collection("bugs");

//* Request Handler
const handler: RequestHandler = async (req, res) => {

	if (!req.body.bug_brief) {
		res.send({ error: 2, message: "No Bug brief providen." });
		return;
    }
    
    if (!req.body.bug_description) {
		res.send({ error: 2, message: "No Bug description providen." });
		return;
	}

    res.sendStatus(200);

    const id = await coll.countDocuments();
    console.log(id);

    coll.insertOne({
        bug_id: id+1,
        bug_brief:req.body.bug_brief,
        bug_description:req.body.bug_description,
        bug_status: req.body.bug_status,
        bug_date: req.body.bug_date,
        bug_userName:req.body.bug_userName,
        bug_userId:req.body.bug_userId
    });
};

//* Export handler
export { handler };
