import {
	BAD_GATEWAY,
	BAD_REQUEST,
	CONFLICT,
	FORBIDDEN,
	GATEWAY_TIMEOUT,
	GONE,
	INTERNAL_SERVER_ERROR,
	LENGTH_REQUIRED,
	METHOD_NOT_ALLOWED,
	NOT_ACCEPTABLE,
	NOT_FOUND,
	NOT_IMPLEMENTED,
	PRECONDITION_FAILED,
	REQUEST_TOO_LONG,
	REQUEST_URI_TOO_LONG,
	SERVICE_UNAVAILABLE,
	TOO_MANY_REQUESTS,
	UNAUTHORIZED,
	UNPROCESSABLE_ENTITY,
	UNSUPPORTED_MEDIA_TYPE,
} from "../status/index.js";

/**
 * Custom HTTP Error class for standardized error handling across backend services.
 *
 * @class HttpError
 * @extends {Error}
 *
 * @example
 * ```ts
 * import { HttpError } from "@repo/backend-core/utils"
 *
 * throw new HttpError("User not found", "NOT_FOUND")
 * // or
 * throw new HttpError("User not found", 404, "USER_NOT_FOUND")
 * ```
 */

// Map of common error code names to their status codes
const STATUS_CODE_MAP: Record<string, number> = {
	BAD_REQUEST,
	UNAUTHORIZED,
	FORBIDDEN,
	NOT_FOUND,
	METHOD_NOT_ALLOWED,
	NOT_ACCEPTABLE,
	CONFLICT,
	GONE,
	LENGTH_REQUIRED,
	PRECONDITION_FAILED,
	REQUEST_TOO_LONG,
	REQUEST_URI_TOO_LONG,
	UNSUPPORTED_MEDIA_TYPE,
	UNPROCESSABLE_ENTITY,
	TOO_MANY_REQUESTS,
	INTERNAL_SERVER_ERROR,
	NOT_IMPLEMENTED,
	BAD_GATEWAY,
	SERVICE_UNAVAILABLE,
	GATEWAY_TIMEOUT,
};

export type ErrorCode = keyof typeof STATUS_CODE_MAP | (string & {});

export class ApiError extends Error {
	statusCode: number;
	code?: ErrorCode;

	// Overload 1: Pass a status code name, auto-resolve the status code number
	constructor(message: string, code: ErrorCode);
	// Overload 2: Pass explicit status code number and optional code string
	constructor(message: string, statusCode: number, code?: ErrorCode);
	// Implementation
	constructor(
		message: string,
		statusCodeOrCode: number | ErrorCode,
		code?: ErrorCode,
	) {
		super(message);

		if (typeof statusCodeOrCode === "number") {
			// Traditional API: (message, statusCode, code?)
			this.statusCode = statusCodeOrCode;
			this.code = code;
		} else {
			// Simple API: (message, code) - auto-resolve status code
			this.code = statusCodeOrCode;
			this.statusCode = STATUS_CODE_MAP[statusCodeOrCode] ?? 500;
		}

		this.name = "HttpError";
	}
}
