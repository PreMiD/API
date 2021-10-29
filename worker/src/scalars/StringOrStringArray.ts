import { UserInputError } from "apollo-server-core";
import { GraphQLScalarType, StringValueNode } from "graphql";

export default new GraphQLScalarType({
	name: "StringOrStringArray",
	description: "String or array of strings.",
	parseValue(value) {
		return value;
	},
	parseLiteral(ast) {
		if (
			ast.kind === "ListValue" &&
			ast.values.filter(v => v.kind !== "StringValue").length
		)
			throw new UserInputError("Provided array must only contain strings.");

		if (ast.kind !== "ListValue" && ast.kind !== "StringValue")
			throw new UserInputError(
				"Provided value must be a string or an array of strings."
			);

		return ast.kind === "StringValue"
			? ast.value
			: ast.values.map(v => (v as StringValueNode).value);
	}
});
