import { hostname } from "os";

import * as Sentry from "@sentry/node";

//@ts-ignore
import { name, version } from "../../package.json";

export default function () {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		serverName: hostname(),
		release: `${name}@${version}`,
		integrations: [new Sentry.Integrations.Http({ tracing: true })],
		tracesSampleRate: 0.1
	});

	return Sentry;
}
