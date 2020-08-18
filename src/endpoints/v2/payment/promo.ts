import { getDiscordUser } from "../../util/functions/getDiscordUser";
import { pmdDB } from "../../db/client";
import { RequestHandler } from "express";

//* Define credits collection
const promotions = pmdDB.collection("merchPromotions");

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	if (!req.params["code"]) return res.sendStatus(404);

	let userId: number;
	if (req.params["token"]) {
		getDiscordUser(req.params["token"]).then(async dUser => {
			userId = dUser.id;
		});
	}

	const promo = await promotions.findOne({
		code: req.params["code"],
		userId: null,
	});
	const userPromo = await promotions.findOne({
		code: req.params["code"],
		userId: userId,
	});

	if (userPromo && userPromo.useLimit > 0 && userPromo.expire > Date.now()) {
		return res.send(userPromo);
	} else if (userPromo && userPromo.useLimit === 0) {
		return res.send({ string: "checkout.maximumUses" });
	} else if (userPromo && userPromo.expire <= Date.now()) {
		return res.send({ string: "checkout.expiredCode" });
	} else if (promo && promo.useLimit > 0 && promo.expire > Date.now()) {
		return res.send(promo);
	} else if (promo && promo.expire <= Date.now()) {
		return res.send({ string: "checkout.expiredCode" });
	} else if (promo && promo.useLimit === 0) {
		return res.send({ string: "checkout.maximumUses" });
	} else {
		return res.send({ string: "checkout.invalidCode" });
	}
};

//* Export handler
export { handler };
