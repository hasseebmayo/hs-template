import type { Context, MiddlewareHandler } from "hono";
import type {
	IdempotencyConfig,
	IdempotencyStorage,
	IdempotentResponse,
} from "./types";

const DEFAULT_CONFIG: Required<
	Omit<IdempotencyConfig, "keyExtractor" | "skip" | "onInvalidKey">
> = {
	headerName: "Idempotency-Key",
	ttl: 86400, // 24 hours
	keyPrefix: "idem:",
	methods: ["POST", "PUT", "PATCH", "DELETE"],
	enableLogging: false,
};

/**
 * Validate idempotency key format
 * Should be a UUID or similar unique identifier
 */
function isValidIdempotencyKey(key: string): boolean {
	// Allow UUID v4, alphanumeric with hyphens, 1-255 chars
	return /^[\w-]{1,255}$/.test(key);
}

/**
 * Extract response body from various types
 */
async function extractBody(response: Response): Promise<string> {
	const contentType = response.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const clone = response.clone();
		const json = await clone.json();
		return JSON.stringify(json);
	}

	if (contentType.includes("text/")) {
		const clone = response.clone();
		return await clone.text();
	}

	// For other types, return empty string
	return "";
}

/**
 * Create idempotency middleware for Hono
 *
 * Prevents duplicate processing of requests by caching responses based on an idempotency key.
 * Useful for preventing duplicate payments, orders, etc.
 *
 * @param storage - Idempotency storage implementation
 * @param config - Idempotency configuration options
 * @returns Hono middleware
 *
 * @example
 * ```ts
 * import { Hono } from "hono"
 * import { createRedisClient } from "@repo/redis"
 * import { idempotency, RedisIdempotencyStorage } from "@repo/idempotency"
 *
 * const redis = createRedisClient({ url: process.env.REDIS_URL })
 * const storage = new RedisIdempotencyStorage(redis)
 *
 * const app = new Hono()
 *
 * // Apply to all routes
 * app.use("*", idempotency(storage))
 *
 * // Or specific routes
 * app.use("/api/payments/*", idempotency(storage, { ttl: 3600 }))
 *
 * app.post("/api/payments", async (c) => {
 *   // This will only execute once per unique Idempotency-Key
 *   const payment = await processPayment()
 *   return c.json(payment, 201)
 * })
 * ```
 */
export function idempotency(
	storage: IdempotencyStorage,
	config: IdempotencyConfig = {},
): MiddlewareHandler {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };

	return async (c: Context, next) => {
		const method = c.req.method.toUpperCase();

		// Skip if method not in list
		if (!mergedConfig.methods.includes(method)) {
			return await next();
		}

		// Skip if custom skip function returns true
		if (config.skip?.(c)) {
			return await next();
		}

		// Extract idempotency key
		let idempotencyKey: string | null = null;

		if (config.keyExtractor) {
			idempotencyKey = config.keyExtractor(c);
		} else {
			idempotencyKey =
				c.req.header(mergedConfig.headerName) ||
				c.req.query("idempotencyKey") ||
				null;
		}

		// If no key provided, proceed normally
		if (!idempotencyKey) {
			if (mergedConfig.enableLogging) {
				console.log(
					`[Idempotency] No key provided for ${method} ${c.req.path}`,
				);
			}
			return await next();
		}

		// Validate key format
		if (!isValidIdempotencyKey(idempotencyKey)) {
			if (config.onInvalidKey) {
				return config.onInvalidKey(c);
			}
			return c.json(
				{
					success: false,
					error: {
						message:
							"Invalid idempotency key format. Must be alphanumeric with hyphens, 1-255 characters.",
						code: "INVALID_IDEMPOTENCY_KEY",
					},
				},
				400,
			);
		}

		const storageKey = mergedConfig.keyPrefix + idempotencyKey;

		// Check if we've seen this key before
		const cached = await storage.get(storageKey);

		if (cached) {
			if (mergedConfig.enableLogging) {
				console.log(`[Idempotency] Cache hit for key: ${idempotencyKey}`);
			}

			// Return cached response
			return new Response(cached.body, {
				status: cached.status,
				headers: {
					...cached.headers,
					"X-Idempotency-Replayed": "true",
				},
			});
		}

		if (mergedConfig.enableLogging) {
			console.log(
				`[Idempotency] Processing new request with key: ${idempotencyKey}`,
			);
		}

		// Process the request
		await next();

		// Store the response
		const response = c.res;

		if (response && response.status < 500) {
			// Only cache successful responses and client errors (not server errors)
			try {
				const body = await extractBody(response);
				const headers: Record<string, string> = {};

				// Store relevant headers
				response.headers.forEach((value, key) => {
					if (
						key.toLowerCase() !== "set-cookie" && // Never cache cookies
						key.toLowerCase() !== "date" // Date should be fresh
					) {
						headers[key] = value;
					}
				});

				const idempotentResponse: IdempotentResponse = {
					status: response.status,
					headers,
					body,
					createdAt: Date.now(),
				};

				await storage.set(storageKey, idempotentResponse, mergedConfig.ttl);

				if (mergedConfig.enableLogging) {
					console.log(
						`[Idempotency] Cached response for key: ${idempotencyKey}`,
					);
				}
			} catch (error) {
				console.error("[Idempotency] Failed to cache response:", error);
				// Continue anyway - caching failure shouldn't break the request
			}
		}
	};
}
