import { gql } from "apollo-server-core";
import { readdirSync } from "fs";
import { DocumentNode, print } from "graphql";
import { basename, resolve } from "path";

export const typeDefs = new Promise<DocumentNode>(async r => {
	r(gql`
		scalar Scalar
		scalar StringOrStringArray

		${(await getFields()).map(f => print(f[1].schema))}
		${(await getFields("mutation")).map(f => print(f[1].schema))}
	`);
});

export async function getFields(
	type: "query" | "mutation" = "query",
	path = resolve(process.cwd(), "v3/fields")
) {
	return (
		await Promise.all(
			readdirSync(path)
				.filter(f => !f.endsWith(".js.map"))
				.map(async f => [basename(f, ".js"), await import(resolve(path, f))])
		)
	).filter(f => (f[1].options ? f[1].options.type === type : type === "query"));
}
