/**
 * Type-safe query abstractions for @tanstack/react-query.
 *
 * These components follow the composition pattern recommended in:
 * https://tkdodo.eu/blog/creating-query-abstractions
 *
 * Use queryOptions as the base abstraction, then compose them at usage sites.
 */

export { Fetcher } from "./fetcher";
export { SuspenseFetcher } from "./suspense-fetcher";
