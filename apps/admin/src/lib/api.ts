import { hcQuery } from "@repo/query-rpc";
import createApiClient from "@repo/rpc-client";

const apiClient = createApiClient("");

/**
 * Typed RPC API client with React Query integration.
 *
 * Each endpoint exposes `.queryOptions(...)` and `.mutationOptions(...)`
 * for use with `useQuery` / `useMutation`.
 *
 * @example
 * ```tsx
 * import { api } from "#/lib/api";
 * import { useQuery } from "@tanstack/react-query";
 *
 * const { data } = useQuery(api.users.$get.queryOptions({}));
 * ```
 */
export const api = hcQuery(apiClient);
