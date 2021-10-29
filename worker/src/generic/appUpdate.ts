import { RouteGenericInterface, RouteHandlerMethod } from "fastify/types/route";
import { IncomingMessage, Server, ServerResponse } from "http";

import { dSources } from "../util/dataSources";

const appXML = `
<installerInformation>
  <versionId>VERSIONID</versionId>
  <version>VERSION</version>
  <platformFileList>
      <platformFile>
          <filename>upgrader.exe</filename>
          <platform>windows</platform>
      </platformFile>
      <platformFile>
          <filename>upgrader.app.tgz</filename>
          <platform>osx</platform>
      </platformFile>
  </platformFileList>
  <downloadLocationList>
      <downloadLocation>
          <url>https://dl.premid.app/</url>
      </downloadLocation>
  </downloadLocationList>
</installerInformation>
`;

const handler: RouteHandlerMethod<
	Server,
	IncomingMessage,
	ServerResponse,
	RouteGenericInterface,
	unknown
> = async (req, res) => {
	res.header("Content-Type", "text/xml");

	let xml = appXML;

	const versions = await dSources.versions.get();

	xml = xml
		.replace("VERSIONID", versions.app.replace(/[.]/g, "").padStart(4, "0"))
		.replace("VERSION", versions.app);

	res.send(xml);
};

export default handler;
