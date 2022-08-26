import archiver from "archiver";
import { createWriteStream, existsSync } from "fs";
import { mkdir } from "fs/promises";
import { resolve } from "path";
import { cwd } from "process";

import { dSources } from "../dataSources";

export default async function () {
	if (!existsSync(resolve(cwd(), "tmp"))) await mkdir(resolve(cwd(), "tmp"));

	const presences = await dSources.presences.getAll();

	const stream = createWriteStream(resolve(cwd(), "tmp/presences.zip")),
		archive = archiver("zip", { zlib: { level: 9 } });

	archive.pipe(stream);

	for (const presence of presences) {
		const metadata = JSON.stringify(presence.metadata),
			presenceJs = presence.presenceJs,
			iframeJs = presence.iframeJs;

		archive.directory(presence.metadata.service, "websites");
		archive.append(metadata, {
			name: `websites/${presence.metadata.service}/metadata.json`
		});
		archive.append(presenceJs, {
			name: `websites/${presence.metadata.service}/presence.js`
		});
		if (iframeJs)
			archive.append(iframeJs, {
				name: `websites/${presence.metadata.service}/iframe.js`
			});
	}

	await archive.finalize();
}
