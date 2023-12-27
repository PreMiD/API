import EventEmitter from "events";
import { RedisClusterType } from "redis";
import { type StoredData } from "keyv";

export class KeyvRedis extends EventEmitter {
	ttlSupport = true;
	namespace?: string;
	opts: Record<string, unknown>;
	redis: RedisClusterType<any, any, any>;
	constructor(client: RedisClusterType<any, any, any>) {
		super();
		this.opts = {};
		this.opts.useRedisSets = true;
		this.opts.dialect = "redis";

		this.redis = client;
	}

	_getNamespace(): string {
		return `namespace:${this.namespace!}`;
	}

	_getKeyName = (key: string): string => {
		if (!this.opts.useRedisSets) {
			return `sets:${this._getNamespace()}:${key}`;
		}

		return key;
	};

	async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
		key = this._getKeyName(key);

		const value = await this.redis.get(key);
		if (value === null) {
			return undefined;
		}

		return value;
	}

	async getMany<Value>(
		keys: string[]
	): Promise<Array<StoredData<Value | undefined>>> {
		keys = keys.map(this._getKeyName);
		return (await this.redis.mGet(keys)).map(v => (v === null ? undefined : v));
	}

	async set(key: string, value: any, ttl?: number) {
		if (value === undefined) {
			return undefined;
		}

		key = this._getKeyName(key);

		await this.redis.set(key, value);
		if (ttl) {
			await this.redis.expire(key, ttl);
		}
	}

	async delete(key: string) {
		key = this._getKeyName(key);
		let items = 0;
		items = await this.redis.unlink(key);

		return items > 0;
	}

	async deleteMany(keys: string[]) {
		const deletePromises = keys.map(async key => this.delete(key));
		const results = await Promise.allSettled(deletePromises);
		// @ts-expect-error - results is an array of objects with status and value
		return results.every(result => result.value);
	}

	async has(key: string) {
		const value: number = await this.redis.exists(key);
		return value !== 0;
	}

	async disconnect() {
		return this.redis.disconnect();
	}
}
