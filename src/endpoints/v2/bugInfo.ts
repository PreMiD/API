import { RequestHandler } from "express";
import { pmdDB } from "../../db/client";

//* Define credits collection
const bug = pmdDB.collection("bugUsers");


//* Request Handler
const handler: RequestHandler = async (req, res) => {
	//* userId not providen
	if (!req.params["userId"]) {
		//* send error
		//* return
		res.send({ error: 1, message: "No userId providen." });
		return;
	}

	//* find user
	//* Return user if found
	//* Else return default 3
	bug.findOne({userId:req.params["userId"]}, function(err, result){
		res.send({info:result});
	});
};

//* Export handler
export { handler };