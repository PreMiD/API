import { DataSource } from "apollo-datasource";
import { BaseRedisCache } from "apollo-server-cache-redis";
import { Collection, FindOptions } from "mongodb";

type DataSourceOperation = "findOne" | "find" | "count";

export default class MongoDataSource extends DataSource {
	context: any;
	collection: Collection<Document>;

	cachePrefix: string;

	private pendingResults: { key: string; promise: Promise<any> }[] = [];

	constructor(public cache: BaseRedisCache, collection: Collection<Document>) {
		super();

		this.collection = collection;

		this.cachePrefix = `mongo-${this.collection.dbName}-${this.collection.collectionName}-`;
	}

	initialize({ cache }: { context: any; cache: BaseRedisCache }) {
		this.cache = cache;
	}

	async count(query: {} = {}, options = { ttl: 60 }) {
		const cacheKey = this.getCacheKey("count", query),
			cacheDoc = await this.cache?.get(cacheKey);
		if (cacheDoc) return JSON.parse(cacheDoc);

		const count = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection.countDocuments(query);
			this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return count;
	}

	async find(
		fields: any = {},
		options: { ttl: number; findOptions?: FindOptions<Document> } = {
			ttl: 60
		}
	): Promise<any[]> {
		this.getCacheKey("find", fields, options);
		const cacheKey = this.getCacheKey("find", fields, options),
			cacheDoc = await this.cache?.get(cacheKey);

		if (cacheDoc) return JSON.parse(cacheDoc);

		const docs = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection
				.find(fields, options.findOptions)
				.toArray();
			this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return docs;
	}

	async findOne(
		fields: any = {},
		options: { ttl: number; findOptions?: FindOptions<Document> } = {
			ttl: 60
		}
	) {
		const cacheKey = this.getCacheKey("findOne", fields, options),
			cacheDoc = await this.cache?.get(cacheKey);
		if (cacheDoc) return JSON.parse(cacheDoc);

		const docs = await this.antiSpam(cacheKey, async () => {
			const r = await this.collection.findOne(fields, options.findOptions);
			this.cache?.set(cacheKey, JSON.stringify(r), options);

			return r;
		});

		return docs;
	}

	async delete(
		type: DataSourceOperation,
		fields: any,
		options: { findOptions?: FindOptions<Document> } = {}
	) {
		return await this.cache?.delete(this.getCacheKey(type, fields, options));
	}

	private getCacheKey(
		type: DataSourceOperation,
		fields: any,
		options: { findOptions?: FindOptions<Document> } = {}
	) {
		return (
			this.cachePrefix +
			`${type}-` +
			JSON.stringify(fields) +
			(options.findOptions ? "-" + JSON.stringify(options.findOptions) : "")
		);
	}

	private async antiSpam(key: string, callback: () => Promise<any>) {
		const pR = this.pendingResults.find(r => r.key === key);
		if (pR) return await pR.promise;

		const d = {
			key,
			promise: callback()
		};
		this.pendingResults.push(d);

		const res = await d.promise;

		this.pendingResults = this.pendingResults.filter(r => r.key !== key);

		return res;
	}
}
