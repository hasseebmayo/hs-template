import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "hono";
import { logger } from "../middleware/logger.js";
import notFound from "../middleware/not-found.js";
import onError from "../middleware/on-error.js";

export function createRouter<T extends Env = Env>() {
	return new OpenAPIHono<T>({
		strict: false,
		defaultHook: (result, c) => {
			if (result.success) {
				return;
			}
			console.error(result.error);
			return c.json(
				{
					errors: result.error.issues,
				},
				{
					status: 400,
				},
			);
		},
	});
}

export function createApp<T extends Env = Env>() {
	const app = createRouter<T>();

	app.use(logger());
	app.onError(onError);
	app.notFound(notFound);

	return app;
}
