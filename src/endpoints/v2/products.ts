import { cache } from "../../index";
import { RequestHandler } from "express";

let products = cache.get("merch");

cache.on("update", (_, data) => (products = data));



//* Request Handler
const handler: RequestHandler = async (req, res) => {
    res.send("Hi")
};

//* Export handler
export { handler };
