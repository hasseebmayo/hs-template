// Re-export Redis type from ioredis
export type { Redis } from "ioredis";
export {
	createCache,
	createRedisClient,
	disconnectRedis,
	getRedisClient,
} from "./client";
export type { CacheEntry, CacheOptions, RedisClientConfig } from "./types";
