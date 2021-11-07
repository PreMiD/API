import * as Sentry from "@sentry/node";
import { ApolloError } from "apollo-server-errors";
import { ApolloServerPlugin } from "apollo-server-plugin-base";

import { Context } from "..";

const plugin: ApolloServerPlugin<Context> = {
	async requestDidStart({ request, context }) {
		if (!!request.operationName)
			context.transaction.setName(request.operationName);

		return {
			async willSendResponse({ context }) {
				context.transaction.finish();
			},
			async executionDidStart() {
				return {
					willResolveField({ context, info }) {
						const span = (context as Context).transaction.startChild({
							op: "resolver",
							description: `${info.parentType.name}.${info.fieldName}`
						});
						return span.finish();
					}
				};
			},
			async didEncounterErrors(ctx) {
				// If we couldn't parse the operation, don't
				// do anything here
				if (!ctx.operation) return;

				for (const err of ctx.errors) {
					// Only report internal server errors,
					// all errors extending ApolloError should be user-facing
					if (err instanceof ApolloError) continue;

					// Add scoped report details and send to Sentry
					Sentry.withScope(scope => {
						// Annotate whether failing operation was query/mutation/subscription
						scope.setTag("kind", ctx.operation?.operation);

						// Log query and variables as extras (make sure to strip out sensitive data!)
						scope.setExtra("query", ctx.request.query);
						scope.setExtra("variables", ctx.request.variables);

						if (err.path)
							// We can also add the path as breadcrumb
							scope.addBreadcrumb({
								category: "query-path",
								message: err.path.join(" > "),
								level: Sentry.Severity.Debug
							});

						const transactionId =
							ctx.request.http?.headers.get("x-transaction-id");
						if (transactionId) scope.setTransactionName(transactionId);

						Sentry.captureException(err);
					});
				}
			}
		};
	}
};

export default plugin;
