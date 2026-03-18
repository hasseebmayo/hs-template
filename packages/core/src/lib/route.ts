import type { RouteConfig } from "@hono/zod-openapi";
import { createRoute as createOpenApiRoute } from "@hono/zod-openapi";
import type { ZodSchema } from "zod";
import { jsonContent } from "../openapi/index.js";
import { createErrorSchema } from "../openapi/schemas/index.js";
import { httpStatusCodes } from "../status/index.js";
import { createApiResponseSchema } from "../utils/zod-helper.js";
export type ApiRouteDefinition = ReturnType<typeof createOpenApiRoute>;
export type RouteDefApi = ApiRouteDefinition;

type JsonRequestBodyConfig = {
	content?: {
		"application/json"?: {
			schema?: ZodSchema;
		};
	};
};

export const createApiRoute = <const R extends RouteConfig>({
	responses,

	...config
}: R): R => {
	const requestSchema = (
		config.request?.body as JsonRequestBodyConfig | undefined
	)?.content?.["application/json"]?.schema;
	const errorBodySchema = requestSchema
		? createErrorSchema(requestSchema)
		: undefined;
	const DEFAULT_RESPONSES = {
		[httpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createApiResponseSchema(),
			"Validation error response schema",
		),
		[httpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
			createApiResponseSchema(),
			"Internal server error response schema",
		),
		[httpStatusCodes.BAD_REQUEST]: jsonContent(
			createApiResponseSchema(),
			"Bad request response schema",
		),
		[httpStatusCodes.UNAUTHORIZED]: jsonContent(
			createApiResponseSchema(),
			"Unauthorized response schema",
		),
	};

	const mergedResponses = {
		...DEFAULT_RESPONSES,
		...(responses ?? {}),
	} as NonNullable<RouteConfig["responses"]>;

	if (errorBodySchema) {
		mergedResponses[httpStatusCodes.UNPROCESSABLE_ENTITY] = jsonContent(
			errorBodySchema,
			"Validation error response schema",
		);
	}

	// `createOpenApiRoute` is an identity function at runtime (`<R>(r: R) => R`).
	// We only spread additional default responses on top of the input config —
	// no fields from `R` are removed. The runtime shape is a structural superset of `R`.
	// Double cast needed because TypeScript can't verify the merged responses type.
	return createOpenApiRoute({
		...config,
		responses: mergedResponses,
	}) as unknown as R;
};

export const createRouteApi = createApiRoute;
