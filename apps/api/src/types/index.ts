import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Env } from "hono";
export type AppBinding = {
	Variables: {
		user: string;
	};
};
export type AppOpenAPI = OpenAPIHono<AppBinding>;
export type AppRouteHandler<
	R extends RouteConfig,
	A extends Env = AppBinding,
> = RouteHandler<R, A>;

export type HandlerMapFromRoutes<T extends Record<string, RouteConfig>> = {
	[K in keyof T]: AppRouteHandler<T[K]>;
};
