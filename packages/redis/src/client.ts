import Redis from "ioredis";
import type { CacheOptions, RedisClientConfig } from "./types";

/**
 * Create a new Redis client instance
 *
 * @param config - Redis configuration options
 * @returns Configured Redis client
 *
 * @example
 * ```ts
 * import { createRedisClient } from "@repo/redis"
 *
 * // Using URL
 * const redis = createRedisClient({
 *   url: process.env.REDIS_URL
 * })
 *
 * // Using individual options
 * const redis = createRedisClient({
 *   host: "localhost",
 *   port: 6379,
 *   password: "secret",
 *   keyPrefix: "myapp:"
 * })
 * ```
 */
export function createRedisClient(config: RedisClientConfig): Redis {
	if (!config.url && !config.host) {
		throw new Error(
			"Redis configuration required: provide either 'url' or 'host'",
		);
	}

	if (config.url) {
		return new Redis(config.url, {
			keyPrefix: config.keyPrefix,
			maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
			connectTimeout: config.connectTimeout ?? 10000,
			enableOfflineQueue: config.enableOfflineQueue ?? true,
			...config.options,
		});
	}

	return new Redis({
		host: config.host,
		port: config.port ?? 6379,
		password: config.password,
		db: config.db ?? 0,
		keyPrefix: config.keyPrefix,
		maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
		connectTimeout: config.connectTimeout ?? 10000,
		enableOfflineQueue: config.enableOfflineQueue ?? true,
		...config.options,
	});
}

/**
 * Get or create a singleton Redis client instance
 * Useful for development to avoid creating too many connections
 *
 * @param config - Redis configuration options
 * @param globalKey - Unique key for this Redis connection (default: "redis")
 * @returns Singleton Redis client instance
 *
 * @example
 * ```ts
 * import { getRedisClient } from "@repo/redis"
 *
 * // Same instance across imports
 * export const redis = getRedisClient({
 *   url: process.env.REDIS_URL
 * }, "main-redis")
 * ```
 */
export function getRedisClient(
	config: RedisClientConfig,
	globalKey = "redis",
): Redis {
	const globalForRedis = globalThis as unknown as {
		[key: string]: Redis;
	};

	if (!globalForRedis[globalKey]) {
		globalForRedis[globalKey] = createRedisClient(config);
	}

	return globalForRedis[globalKey];
}

/**
 * Create a cache wrapper with helpful methods
 *
 * @param redis - Redis client instance
 * @returns Cache utility object
 *
 * @example
 * ```ts
 * import { createRedisClient, createCache } from "@repo/redis"
 *
 * const redis = createRedisClient({ url: process.env.REDIS_URL })
 * const cache = createCache(redis)
 *
 * // Set with TTL
 * await cache.set("user:123", { name: "John" }, { ttl: 3600 })
 *
 * // Get typed value
 * const user = await cache.get<User>("user:123")
 *
 * // Delete
 * await cache.del("user:123")
 * ```
 */
export function createCache(redis: Redis) {
	return {
		/**
		 * Set a value in cache
		 */
		async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
			const serializer = options?.serializer ?? JSON.stringify;
			const serialized = serializer(value);

			if (options?.ttl) {
				await redis.setex(key, options.ttl, serialized);
			} else {
				await redis.set(key, serialized);
			}
		},

		/**
		 * Get a value from cache
		 */
		async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
			const value = await redis.get(key);
			if (!value) return null;

			const deserializer = options?.deserializer ?? JSON.parse;
			return deserializer(value) as T;
		},

		/**
		 * Delete a value from cache
		 */
		async del(key: string): Promise<void> {
			await redis.del(key);
		},

		/**
		 * Delete multiple values by pattern
		 */
		async delPattern(pattern: string): Promise<number> {
			const keys = await redis.keys(pattern);
			if (keys.length === 0) return 0;
			return await redis.del(...keys);
		},

		/**
		 * Check if key exists
		 */
		async has(key: string): Promise<boolean> {
			const exists = await redis.exists(key);
			return exists === 1;
		},

		/**
		 * Get time to live for a key
		 */
		async ttl(key: string): Promise<number> {
			return await redis.ttl(key);
		},

		/**
		 * Set expiration for a key
		 */
		async expire(key: string, seconds: number): Promise<boolean> {
			const result = await redis.expire(key, seconds);
			return result === 1;
		},

		/**
		 * Increment a numeric value
		 */
		async increment(key: string, amount = 1): Promise<number> {
			return await redis.incrby(key, amount);
		},

		/**
		 * Decrement a numeric value
		 */
		async decrement(key: string, amount = 1): Promise<number> {
			return await redis.decrby(key, amount);
		},

		/**
		 * Get or set pattern - fetch from cache or compute and cache
		 */
		async getOrSet<T>(
			key: string,
			factory: () => Promise<T>,
			options?: CacheOptions,
		): Promise<T> {
			const cached = await this.get<T>(key, options);
			if (cached !== null) return cached;

			const value = await factory();
			await this.set(key, value, options);
			return value;
		},
	};
}

/**
 * Utility to gracefully disconnect Redis clients
 *
 * @param clients - Redis client(s) to disconnect
 *
 * @example
 * ```ts
 * import { disconnectRedis } from "@repo/redis"
 *
 * // Single client
 * await disconnectRedis(redis)
 *
 * // Multiple clients
 * await disconnectRedis([redis1, redis2])
 * ```
 */
export async function disconnectRedis(clients: Redis | Redis[]): Promise<void> {
	const clientArray = Array.isArray(clients) ? clients : [clients];

	await Promise.all(
		clientArray.map(async (client) => {
			if (client.status === "ready") {
				await client.quit();
			} else {
				client.disconnect();
			}
		}),
	);
}
