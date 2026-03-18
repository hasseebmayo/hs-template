import type { router } from "@repo/api";
import { hc } from "hono/client";

// Create instance to inline type in build
// https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended
// eslint-disable-next-line
const client = hc<router>("");

export type Client = typeof client;

/**
 * Create a typed Hono RPC client for the API.
 *
 * @param baseUrl - Base URL of the API server (default: "http://localhost:4000")
 *
 * Usage in admin:
 * ```ts
 * import { createApiClient } from "@repo/rpc-client";
 * import { hcQuery } from "@repo/query-rpc";
 *
 * const apiClient = createApiClient(import.meta.env.VITE_API_URL);
 * const api = hcQuery(apiClient);
 *
 * // In a component:
 * const { data } = useQuery(api.users.$get.queryOptions({}));
 * ```
 */
export default (...args: Parameters<typeof hc>): Client => hc<router>(...args);
