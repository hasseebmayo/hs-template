import type { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { Env } from "hono";

/**
 * OpenAPI configuration options.
 */
/**
 * Scalar theme options.
 *
 */
export type ScalarTheme =
	| "kepler"
	| "default"
	| "alternate"
	| "moon"
	| "purple"
	| "solarized"
	| "bluePlanet"
	| "deepSpace"
	| "saturn"
	| "mars"
	| "laserwave"
	| "none";

/**
 * Scalar layout options.
 */
export type ScalarLayout = "modern" | "classic";

export interface OpenAPIConfig {
	/** API title */
	title?: string;
	/** API version */
	version?: string;
	/** Scalar theme (default: 'kepler') */
	theme?: ScalarTheme;
	/** Layout type (default: 'modern') */
	layout?: ScalarLayout;
	/** Show sidebar (default: true) */
	showSidebar?: boolean;
	/** Hide models section (default: true) */
	hideModels?: boolean;
	/** Preferred security scheme (default: 'bearerAuth') */
	preferredSecurityScheme?: string;
}

/**
 * Configure OpenAPI documentation for a Hono app.
 *
 * @param app - The OpenAPIHono application instance
 * @param config - Configuration options
 *
 * @example
 * ```ts
 * import { configureOpenAPI } from "@repo/backend-core/lib/configure-open-api"
 * import { createRouter } from "@repo/backend-core/lib/create-app"
 *
 * const app = createRouter()
 * configureOpenAPI(app, {
 *   title: "My API",
 *   version: "1.0.0"
 * })
 * ```
 */
export function configureOpenAPI<T extends Env = Env>(
	app: OpenAPIHono<T>,
	config: OpenAPIConfig = {},
) {
	const {
		title = "API Documentation",
		version = "1.0.0",
		theme = "kepler",
		layout = "modern",
		showSidebar = true,
		hideModels = true,
		preferredSecurityScheme = "bearerAuth",
	} = config;

	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version,
			title,
		},
	});

	app.get(
		"/reference",
		Scalar({
			// Theme and Layout
			theme,
			layout,

			// OpenAPI specification URL
			url: "/doc",

			// UI Customization
			showSidebar,
			hideModels,
			hideDownloadButton: false,
			hideTestRequestButton: false,

			// Search functionality with hotkey
			searchHotKey: "k",
			hiddenClients: true,
			hideClientButton: true,

			// HTTP Client Configuration
			defaultHttpClient: {
				targetKey: "js",
				clientKey: "fetch",
			},

			// Authentication configuration
			authentication: {
				preferredSecurityScheme,
			},
		}),
	);
}
