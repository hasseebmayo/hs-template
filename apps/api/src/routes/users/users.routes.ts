import { z } from "@hono/zod-openapi";
import { createApiRoute } from "@repo/core/routing";
import { ROUTE_TAGS } from "~/config/tags";
import HTTP_STATUS_CODES from "~/lib/status";
import { jsonContent, jsonContentRequired } from "~/lib/stoker";
import { zodResponse } from "~/lib/zod-helper";
import { CreateUserSchema, UserResponseSchema } from "./users.schema";

export const USER_ROUTES = {
	list: createApiRoute({
		method: "get",
		path: "/",
		tags: [ROUTE_TAGS.users],

		responses: {
			[HTTP_STATUS_CODES.OK]: jsonContent(
				zodResponse(z.array(UserResponseSchema)),
				"List of users",
			),
		},
	}),

	getById: createApiRoute({
		method: "get",
		path: "/{id}",
		tags: [ROUTE_TAGS.users],
		request: {
			params: jsonContentRequired(z.object({ id: z.string().uuid() }), "User ID param (UUID)")
		},
		responses: {
			[HTTP_STATUS_CODES.OK]: jsonContent(UserResponseSchema, "Single user"),
			[HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
				zodResponse(),
				"User not found",
			),
		},
	}),

	create: createApiRoute({
		method: "post",
		path: "/",
		tags: [ROUTE_TAGS.users],
		request: {
			body: jsonContentRequired(CreateUserSchema, "New user payload"),
		},
		responses: {
			[HTTP_STATUS_CODES.CREATED]: jsonContent(
				UserResponseSchema,
				"Created user",
			),
		},
	}),
} as const;

export type UserRoutes = typeof USER_ROUTES;
