import type {
	DefaultError,
	QueryKey,
	UseSuspenseQueryOptions,
	UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

type SuspenseFetcherProps<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = {
	/**
	 * Suspense query options from api.resource.$method.queryOptions({})
	 * or any queryOptions() factory function
	 */
	queryOptions: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

	/**
	 * Optional additional query options to compose on top
	 * Example: { staleTime: 5000, retry: 3 }
	 */
	options?: Partial<
		UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
	>;

	/**
	 * Render function for the loaded state
	 * Data is always defined with Suspense queries
	 */
	children: (
		data: TData,
		query: UseSuspenseQueryResult<TData, TError>,
	) => ReactNode;

	/**
	 * Optional error render function
	 * If not provided, errors will be thrown to Error Boundary
	 */
	renderError?: (
		error: TError,
		query: UseSuspenseQueryResult<TData, TError>,
	) => ReactNode;
};

/**
 * Suspense-enabled query fetcher component.
 * Use this with React Suspense boundaries for automatic loading states.
 *
 * @example
 * ```tsx
 * import { api } from "#/lib/api";
 * import { SuspenseFetcher } from "@repo/ui/query";
 * import { Suspense } from "react";
 *
 * function Users() {
 *   return (
 *     <Suspense fallback={<Spinner />}>
 *       <SuspenseFetcher
 *         queryOptions={api.users.$get.queryOptions({})}
 *       >
 *         {(users) => (
 *           <ul>
 *             {users.map((user) => (
 *               <li key={user.id}>{user.email}</li>
 *             ))}
 *           </ul>
 *         )}
 *       </SuspenseFetcher>
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function SuspenseFetcher<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>({
	queryOptions,
	options,
	children,
	renderError,
}: SuspenseFetcherProps<TQueryFnData, TError, TData, TQueryKey>) {
	// Compose base queryOptions with any additional options
	const composedOptions = options
		? { ...queryOptions, ...options }
		: queryOptions;

	try {
		const query = useSuspenseQuery(composedOptions);

		// With Suspense, data is always defined when we get here
		return children(query.data, query);
	} catch (error) {
		// Handle errors if renderError is provided
		if (renderError && error instanceof Error) {
			// Create a minimal query result for error rendering
			const errorQuery = {
				error: error as TError,
				isError: true,
			} as UseSuspenseQueryResult<TData, TError>;
			return renderError(error as TError, errorQuery);
		}
		// Otherwise, let it bubble to Error Boundary
		throw error;
	}
}
