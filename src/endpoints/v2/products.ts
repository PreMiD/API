import { cache } from "../../index";
import { RequestHandler } from "express";

let products = cache.get("merch");

cache.on("update", (_, data) => (products = data));

let categories = [];
let types = {};

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	products
		.filter(p => p.title === "categories")[0]
		["list"].forEach(category_name => {
			categories.push(category_name);
			types[category_name] = [];
		});

	products
		.filter(p => p.category != undefined && p.status === "Live")
		.forEach(product_info => {
			types[product_info.category].push(product_info);
		});

	res.send({ Products: types, Categories: categories });
};

//* Export handler
export { handler };
