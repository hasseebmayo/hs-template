import type { Redis } from "ioredis";
import type { IdempotencyStorage, IdempotentResponse } from "./types";

/**
 * Redis-based idempotency storage implementation
 *
 * @example
 * ```ts
 * import { createRedisClient } from "@repo/redis"
 * import { RedisIdempotencyStorage } from "@repo/idempotency/storage"
 *
 * const redis = createRedisClient({ url: process.env.REDIS_URL })
 * const storage = new RedisIdempotencyStorage(redis)
 * ```
 */
export class RedisIdempotencyStorage implements IdempotencyStorage {
	constructor(
		private readonly redis: Redis,
		private readonly keyPrefix = "idem:",
	) {}

	async get(key: string): Promise<IdempotentResponse | null> {
		const fullKey = this.keyPrefix + key;
		const value = await this.redis.get(fullKey);

		if (!value) return null;

		try {
			return JSON.parse(value) as IdempotentResponse;
		} catch {
			// Corrupted data, delete it
			await this.redis.del(fullKey);
			return null;
		}
	}

	async set(
		key: string,
		response: IdempotentResponse,
		ttl: number,
	): Promise<void> {
		const fullKey = this.keyPrefix + key;
		const value = JSON.stringify(response);
		await this.redis.setex(fullKey, ttl, value);
	}

	async delete(key: string): Promise<void> {
		const fullKey = this.keyPrefix + key;
		await this.redis.del(fullKey);
	}

	async exists(key: string): Promise<boolean> {
		const fullKey = this.keyPrefix + key;
		const result = await this.redis.exists(fullKey);
		return result === 1;
	}
}

/**
 * In-memory idempotency storage (for testing/development)
 *
 * @example
 * ```ts
 * import { MemoryIdempotencyStorage } from "@repo/idempotency/storage"
 *
 * const storage = new MemoryIdempotencyStorage()
 * ```
 */
export class MemoryIdempotencyStorage implements IdempotencyStorage {
	private store = new Map<
		string,
		{ response: IdempotentResponse; expiresAt: number }
	>();

	async get(key: string): Promise<IdempotentResponse | null> {
		const entry = this.store.get(key);

		if (!entry) return null;

		// Check expiration
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}

		return entry.response;
	}

	async set(
		key: string,
		response: IdempotentResponse,
		ttl: number,
	): Promise<void> {
		const expiresAt = Date.now() + ttl * 1000;
		this.store.set(key, { response, expiresAt });
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async exists(key: string): Promise<boolean> {
		const entry = this.store.get(key);
		if (!entry) return false;

		// Check expiration
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Clear all entries (useful for testing)
	 */
	clear(): void {
		this.store.clear();
	}
}
