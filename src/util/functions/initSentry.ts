import { hostname } from "os";

import * as Sentry from "@sentry/node";

//@ts-ignore
import { name, version } from "../../package.json";

export default function () {
	if (process.env.NODE_ENV !== "production") return;
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		serverName: hostname(),
		release: `${name}@${version}`,
		tracesSampleRate: 1.0
	});

	return Sentry;
}
