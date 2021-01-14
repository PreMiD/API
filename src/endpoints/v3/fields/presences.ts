import { GraphQLError, GraphQLInt, GraphQLString } from "graphql";
import { GraphQLList, GraphQLScalarType } from "graphql/type/definition";

import { cache } from "../../../index";
import { prepareUsage } from "../../v2/presenceUsage";
import { presenceType } from "../types/presences/presencesType";

let science = cache.get("science"),
	presencesCache = preparePresences(cache.get("presences"));

cache.on("update", (_, data) => (presencesCache = preparePresences(data)), {
	only: "presences"
});
cache.on("update", (_, data) => (science = data), {
	only: "science"
});

function preparePresences(cache) {
	const usage = prepareUsage(science);

	cache = cache.map(c => {
		c.users = usage[c.metadata.service];
		return c;
	});
	return cache;
}

export const presences = {
	type: GraphQLList(presenceType),
	args: {
		service: {
			type: new GraphQLScalarType({
				name: "StringOrStringArray"
			}),
			defaultValue: null
		},
		author: { type: GraphQLString, defaultValue: null },
		contributor: { type: GraphQLString, defaultValue: null },
		start: { type: GraphQLInt, defaultValue: null },
		limit: { type: GraphQLInt, defaultValue: null },
		query: { type: GraphQLString, defaultValue: null },
		tag: { type: GraphQLString, defaultValue: null }
	},
	resolve(
		_,
		args: {
			service?: string | string[];
			author?: string;
			contributor?: string;
			start?: number;
			limit?: number;
			query?: string;
			tag?: string;
		}
	) {
		if (
			args.service &&
			!(
				typeof args.service === "string" ||
				(Array.isArray(args.service) &&
					args.service.every(v => typeof v === "string"))
			)
		)
			throw new GraphQLError(
				"Argument Service must be a string or an array of strings."
			);

		let result = presencesCache;

		result = result.filter(p => {
			let checksToPass = 5,
				checksThatPassed = 0;

			if (args.service) {
				if (
					typeof args.service === "string"
						? args.service === p.metadata.service
						: args.service.some(s => p.metadata.service === s)
				)
					checksThatPassed++;
			} else checksThatPassed++;
			if (args.author) {
				if (args.author === p.metadata.author.id) checksThatPassed++;
			} else checksThatPassed++;
			if (args.contributor) {
				if (
					p.metadata.contributors &&
					p.metadata.contributors.find(c => c.id === args.contributor)
				)
					checksThatPassed++;
			} else checksThatPassed++;
			if (args.query) {
				if (p.metadata.service.toLowerCase().includes(args.query.toLowerCase()))
					checksThatPassed++;
			} else checksThatPassed++;
			if (args.tag) {
				if (
					!Array.isArray(p.metadata.tags) &&
					p.metadata.tags.toLowerCase() === args.tag.toLowerCase()
				)
					checksThatPassed++;
				else if (
					Array.isArray(p.metadata.tags) &&
					p.metadata.tags.find(t => t.toLowerCase() === args.tag.toLowerCase())
				)
					checksThatPassed++;
			} else checksThatPassed++;

			return checksToPass === checksThatPassed;
		});

		if (args.start) result = result.slice(args.start, result.length);
		if (args.limit) result = result.slice(0, args.limit);

		return result;
	}
};
