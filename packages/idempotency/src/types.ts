import type { Context } from "hono";

/**
 * Idempotency key configuration
 */
export interface IdempotencyConfig {
	/**
	 * Header name for idempotency key (default: "Idempotency-Key")
	 */
	headerName?: string;

	/**
	 * Time to live for stored responses in seconds (default: 86400 = 24 hours)
	 */
	ttl?: number;

	/**
	 * Key prefix for storage (default: "idem:")
	 */
	keyPrefix?: string;

	/**
	 * HTTP methods to apply idempotency (default: ["POST", "PUT", "PATCH", "DELETE"])
	 */
	methods?: string[];

	/**
	 * Custom key extractor function
	 */
	keyExtractor?: (c: Context) => string | null;

	/**
	 * Skip idempotency check function
	 */
	skip?: (c: Context) => boolean;

	/**
	 * Custom error handler when idempotency key is invalid
	 */
	onInvalidKey?: (c: Context) => Response | Promise<Response>;

	/**
	 * Enable logging (default: false)
	 */
	enableLogging?: boolean;
}

/**
 * Stored idempotent response
 */
export interface IdempotentResponse {
	/**
	 * HTTP status code
	 */
	status: number;

	/**
	 * Response headers
	 */
	headers: Record<string, string>;

	/**
	 * Response body (stringified)
	 */
	body: string;

	/**
	 * Timestamp when response was created
	 */
	createdAt: number;
}

/**
 * Idempotency storage interface
 */
export interface IdempotencyStorage {
	/**
	 * Get stored response by idempotency key
	 */
	get(key: string): Promise<IdempotentResponse | null>;

	/**
	 * Store response with idempotency key
	 */
	set(key: string, response: IdempotentResponse, ttl: number): Promise<void>;

	/**
	 * Delete stored response
	 */
	delete(key: string): Promise<void>;

	/**
	 * Check if key exists
	 */
	exists(key: string): Promise<boolean>;
}

/**
 * Idempotency middleware state
 */
export interface IdempotencyState {
	idempotencyKey?: string;
	isIdempotent?: boolean;
}
