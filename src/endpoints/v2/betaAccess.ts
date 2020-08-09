import { pmdDB } from "../../db/client";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

//* Define credits collection
const betaUsers = pmdDB.collection("betaUsers");
const alphaUsers = pmdDB.collection("alphaUsers");

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	//* userId not providen
	if (!req.params["userId"]) {
		//* send error
		//* return
		res.status(401).send({ error: 1, message: "No userId providen." });
		return;
	}

	//* Find user in db
	//* Send response
	try {
		const user =
			(await betaUsers.findOne(
				{ userId: req.params["userId"] },
				{ projection: { _id: false, keysLeft: false } }
			)) ||
			(await alphaUsers.findOne(
				{ userId: req.params["userId"] },
				{ projection: { _id: false, keysLeft: false } }
			));

		res.send({ access: user ? true : false });
	} catch (err) {
		res.send(500);
	}
};

//* Export handler
export { handler };
