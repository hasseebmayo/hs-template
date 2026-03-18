import { createHonoApp } from "~/lib/router";
import { registerRoutes } from "./app";

const app = createHonoApp();

// Create router instance to extract type for RPC client
export const router = registerRoutes(app);

// Export the router type for RPC client type inference
export type router = typeof router;

export default {
	fetch: app.fetch,
	port: 4000,
};
