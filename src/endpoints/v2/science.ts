import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { pmdDB } from "../../db/client";

//* Define credits collection
const science = pmdDB.collection("science");

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	const body = req.body as {
		identifier?: string;
		presences?: string[];
		platform?: { os?: string; arch?: string };
	};

	if (req.method === "POST") {
		if (
			!body.identifier ||
			typeof body.identifier !== "string" ||
			!body.presences ||
			!Array.isArray(body.presences)
		) {
			res.send(400);
			return;
		}

		let data: any = {
			identifier: body.identifier,
			presences: body.presences,
			updated: Date.now()
		};

		if (body.platform) data.platform = body.platform;

		science
			.findOneAndUpdate(
				{ identifier: body.identifier },
				{
					$set: data
				},
				{ upsert: true }
			)
			.then(() => res.send(200))
			.catch(() => res.send(500));
	} else {
		let identifier;

		if (req.method === "DELETE") {
			if (!body.identifier) {
				res.send(400);
				return;
			}

			identifier = body.identifier;
		} else if (req.method === "GET") {
			if (!(req.params as any).identifier) {
				res.send(400);
				return;
			}

			identifier = (req.params as any).identifier;
		} else {
			res.send(405);
			return;
		}

		science
			.findOneAndDelete({ identifier: identifier })
			.then(response => {
				if (response.value) {
					if (req.method === "DELETE") res.send(200);
					else res.redirect("https://premid.app");
				} else res.send(404);
			})
			.catch(() => res.send(500));
	}
};

//* Export handler
export { handler };
