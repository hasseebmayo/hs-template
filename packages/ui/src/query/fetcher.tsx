import type {
	DefaultError,
	QueryKey,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Type-safe props that preserve inference from queryOptions
type FetcherProps<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = {
	/**
	 * Query options from api.resource.$method.queryOptions({})
	 * or any queryOptions() factory function
	 */
	queryOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

	/**
	 * Optional additional query options to compose on top
	 * Example: { staleTime: 5000, retry: 3 }
	 */
	options?: Partial<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

	/**
	 * Render function for the loaded state
	 */
	children: (data: TData, query: UseQueryResult<TData, TError>) => ReactNode;

	/**
	 * Optional loading fallback (defaults to null)
	 */
	fallback?: ReactNode;

	/**
	 * Optional error render function
	 * If not provided, errors will be thrown (good for Error Boundaries)
	 */
	renderError?: (
		error: TError,
		query: UseQueryResult<TData, TError>,
	) => ReactNode;
};

/**
 * Type-safe query fetcher component that composes query options.
 *
 * @example
 * ```tsx
 * import { api } from "#/lib/api";
 * import { Fetcher } from "@repo/ui/query";
 *
 * <Fetcher
 *   queryOptions={api.users.$get.queryOptions({})}
 *   fallback={<Spinner />}
 * >
 *   {(users) => (
 *     <ul>
 *       {users.map((user) => (
 *         <li key={user.id}>{user.email}</li>
 *       ))}
 *     </ul>
 *   )}
 * </Fetcher>
 * ```
 *
 * @example With composed options
 * ```tsx
 * <Fetcher
 *   queryOptions={api.users.$get.queryOptions({})}
 *   options={{ staleTime: 60_000, retry: 3 }}
 * >
 *   {(users) => <UserList users={users} />}
 * </Fetcher>
 * ```
 */
export function Fetcher<
	TQueryFnData,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>({
	queryOptions,
	options,
	children,
	fallback = null,
	renderError,
}: FetcherProps<TQueryFnData, TError, TData, TQueryKey>) {
	// Compose base queryOptions with any additional options
	const composedOptions = options
		? { ...queryOptions, ...options }
		: queryOptions;

	const query = useQuery(composedOptions);

	// Loading state
	if (query.isPending) {
		return fallback;
	}

	// Error state
	if (query.isError) {
		if (renderError) {
			return renderError(query.error, query);
		}
		// If no error handler, throw to nearest Error Boundary
		throw query.error;
	}

	// Success state - data is guaranteed to exist here
	return children(query.data, query);
}
