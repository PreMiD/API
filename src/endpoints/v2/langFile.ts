import { RequestHandler } from "express";
import { cache } from "../../index";

//* Request Handler
const handler: RequestHandler = async (req, res) => {
	const langFiles = cache.get("langFiles").data;
	if (req.path.endsWith("/list")) {
		res.send(
			langFiles.filter(lF => lF.project === "extension").map(lF => lF.lang)
		);
		return;
	}

	if (!req.params["project"] || !req.params["lang"]) {
		res.sendStatus(404);
		return;
	}

	if (!["extension", "website"].includes(req.params["project"])) {
		res.send(404);
		return;
	}

	let langFile = langFiles.find(
		lF => lF.project === req.params["project"] && lF.lang === req.params["lang"]
	);

	if (!langFile) {
		res.send({ error: 6, message: "No translations found." });
		return;
	}

	langFile = { translations: langFile.translations };

	res.send(
		Object.assign(
			{},
			...Object.keys(langFile.translations).map(translationKey => {
				const newKey = translationKey.replace(/[_]/g, ".");
				return {
					[newKey]: langFile.translations[translationKey]
				};
			})
		)
	);
};

//* Export handler
export { handler };
