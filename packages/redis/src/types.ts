import type { RedisOptions } from "ioredis";

/**
 * Configuration options for creating a Redis client
 */
export interface RedisClientConfig {
	/**
	 * Redis connection URL (redis://host:port)
	 * Takes precedence over individual options
	 */
	url?: string;

	/**
	 * Redis host (default: localhost)
	 */
	host?: string;

	/**
	 * Redis port (default: 6379)
	 */
	port?: number;

	/**
	 * Redis password
	 */
	password?: string;

	/**
	 * Redis database number (default: 0)
	 */
	db?: number;

	/**
	 * Optional prefix for all keys
	 */
	keyPrefix?: string;

	/**
	 * Max retry attempts (default: 3)
	 */
	maxRetriesPerRequest?: number;

	/**
	 * Connection timeout in milliseconds (default: 10000)
	 */
	connectTimeout?: number;

	/**
	 * Enable offline queue (default: true)
	 */
	enableOfflineQueue?: boolean;

	/**
	 * Additional ioredis options
	 */
	options?: Partial<RedisOptions>;
}

/**
 * Cache entry with TTL
 */
export interface CacheEntry<T = unknown> {
	value: T;
	expiresAt: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
	/**
	 * Time to live in seconds
	 */
	ttl?: number;

	/**
	 * Custom serializer (default: JSON.stringify)
	 */
	serializer?: (value: unknown) => string;

	/**
	 * Custom deserializer (default: JSON.parse)
	 */
	deserializer?: (value: string) => unknown;
}
