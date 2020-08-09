import { cache } from "../../index";
import { Server, IncomingMessage, ServerResponse } from "http";
import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";

let langFiles = prepareLangFiles(cache.get("langFiles"));
cache.on("update", (_, data) => (langFiles = prepareLangFiles(data)), {
	only: "langFiles"
});

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	if (req.url.endsWith("/list") && !req.params["project"]) {
		res.send(
			langFiles
				.filter(lF => lF.project === "extension")
				.map(lF => {
					let lang = lF.lang;

					switch (lang.toLowerCase()) {
						case "ja":
							lang = "ja_JP";
							break;
						case "zh-cn":
							lang = "zh_CN";
							break;
						case "zh-tw":
							lang = "zh_TW";
							break;
						case "ko":
							lang = "ko_KR";
							break;
						default:
							break;
					}

					return lang;
				})
		);
		return;
	}

	let langFile;
	const projectParamLwr = req.params["project"].toLowerCase();

	// get strings of given project name
	if (["extension", "website", "presence"].includes(req.params["project"])) {
		langFile = langFiles.find(
			lF =>
				lF.project === req.params["project"] && lF.lang === req.params["lang"]
		);
	} else {
		const masterLangFile = langFiles.find(
			lF => lF.project === "presence" && lF.lang === "en"
		);
		const masterLangKeys = Object.keys(masterLangFile.translations);

		if (!masterLangKeys.find(key => key.startsWith(`${projectParamLwr}_`))) {
			res.send(404);
			return;
		}

		// list 100% translated locales for given presence
		if (req.url.endsWith("/list")) {
			let referenceKeys = masterLangKeys.filter(
				keyName =>
					keyName.startsWith(`${projectParamLwr}_`) ||
					keyName.startsWith(`general_`)
			);

			const locales = [];
			for (const langFile of langFiles.filter(
				lF => lF.project === "presence"
			)) {
				let fileKeys = Object.keys(langFile.translations).filter(
					lF =>
						lF.startsWith(`${projectParamLwr}_`) || lF.startsWith(`general_`)
				);

				if (fileKeys.length === referenceKeys.length) {
					locales.push(langFile.lang);
				}
			}

			return res.send(locales);

			// get presence strings in given language
		} else if (req.params["lang"]) {
			let allStrings = langFiles.find(
				lF => lF.project === "presence" && lF.lang === req.params["lang"]
			);

			if (!allStrings) {
				return res.send(404);
			}

			allStrings = formatLangFile(allStrings);

			const strings = {};

			for (const key of Object.keys(allStrings)) {
				if (key.startsWith(`${projectParamLwr}.`)) {
					strings[key] = allStrings[key];
				}
			}

			return res.send(strings);
		}

		res.send(404);
		return;
	}

	if (!langFile) {
		res.send({ error: 6, message: "No translations found." });
		return;
	}

	langFile = { translations: langFile.translations };

	res.send(formatLangFile(langFile));
};

function formatLangFile(langFile) {
	return Object.assign(
		{},
		...Object.keys(langFile.translations).map(translationKey => {
			const newKey = translationKey.replace(/[_]/g, ".");
			return {
				[newKey]: langFile.translations[translationKey]
			};
		})
	);
}

function prepareLangFiles(langFiles) {
	langFiles.map(lF => {
		if (lF.project !== "extension") return;

		switch (lF.lang) {
			case "ja_JP":
				lF.lang = "ja";
				break;
			case "zh_CN":
				lF.lang = "zh-CN";
				break;
			case "zh_TW":
				lF.lang = "zh-TW";
				break;
			case "zh_HK":
				lF.lang = "zh-TW";
				break;
			case "ko_KR":
				lF.lang = "ko";
				break;
		}
	});
	return langFiles;
}

//* Export handler
export { handler };
