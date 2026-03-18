import type { Context } from "hono";

/**
 * Standard API response utilities for consistent response formatting.
 *
 * @module response
 */

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: {
		message: string;
		code?: string;
	};
	meta?: Record<string, unknown>;
}

/**
 * Create a success response.
 *
 * @param data - Response data
 * @param meta - Optional metadata
 * @returns Success response object
 *
 * @example
 * ```ts
 * import { successResponse } from "@repo/backend-core/lib/response"
 *
 * return c.json(successResponse({ user }))
 * ```
 */
export function successResponse<T>(
	data: T,
	meta?: Record<string, unknown>,
): ApiResponse<T> {
	return {
		success: true,
		data,
		...(meta && { meta }),
	};
}

/**
 * Create an error response.
 *
 * @param message - Error message
 * @param code - Optional error code
 * @returns Error response object
 *
 * @example
 * ```ts
 * import { errorResponse } from "@repo/backend-core/lib/response"
 *
 * return c.json(errorResponse("User not found", "USER_NOT_FOUND"), 404)
 * ```
 */
export function errorResponse(
	message: string,
	code?: string,
): ApiResponse<never> {
	return {
		success: false,
		error: {
			message,
			...(code && { code }),
		},
	};
}

/**
 * Send a JSON success response with proper status code.
 *
 * @param c - Hono context
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param meta - Optional metadata
 * @returns JSON response
 *
 * @example
 * ```ts
 * import { jsonSuccess } from "@repo/backend-core/lib/response"
 *
 * return jsonSuccess(c, { user }, 201)
 * ```
 */
export function jsonSuccess<T>(
	c: Context,
	data: T,
	status = 200 as const,
	meta?: Record<string, unknown>,
) {
	// biome-ignore lint: Hono expects any status code type
	return c.json(successResponse(data, meta), status as any);
}

/**
 * Send a JSON error response with proper status code.
 *
 * @param c - Hono context
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param code - Optional error code
 * @returns JSON response
 *
 * @example
 * ```ts
 * import { jsonError } from "@repo/backend-core/lib/response"
 *
 * return jsonError(c, "User not found", 404, "USER_NOT_FOUND")
 * ```
 */
export function jsonError(
	c: Context,
	message: string,
	status = 400 as const,
	code?: string,
) {
	// biome-ignore lint: Hono expects any status code type
	return c.json(errorResponse(message, code), status as any);
}
