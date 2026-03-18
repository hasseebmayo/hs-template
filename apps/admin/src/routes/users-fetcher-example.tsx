/**
 * Example: Using Fetcher component for type-safe query abstractions
 *
 * This demonstrates the pattern from https://tkdodo.eu/blog/creating-query-abstractions
 * Compare this with users.tsx to see the difference in approaches.
 *
 * Note: This is an example file, not a registered route.
 * To use, copy the pattern into your actual route component.
 */

import { Fetcher } from "@repo/ui/query";
import { api } from "#/lib/api";

/**
 * Basic usage with Fetcher
 */
export function UsersPageWithFetcher() {
	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">Users (Fetcher Pattern)</h1>

			<Fetcher
				queryOptions={api.users.$get.queryOptions({})}
				fallback={<div className="text-gray-500 py-4">Loading users…</div>}
				renderError={(error) => (
					<div className="text-red-500 py-4">
						Failed to load users: {error.message}
					</div>
				)}
			>
				{(response, query) => (
					<div>
						<table className="w-full border-collapse border border-gray-200 rounded-lg">
							<thead className="bg-gray-50">
								<tr>
									<th className="border border-gray-200 px-4 py-2 text-left">
										Name
									</th>
									<th className="border border-gray-200 px-4 py-2 text-left">
										Email
									</th>
									<th className="border border-gray-200 px-4 py-2 text-left">
										Role
									</th>
								</tr>
							</thead>
							<tbody>
								{response.data?.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50">
										<td className="border border-gray-200 px-4 py-2">
											{user.firstName} {user.lastName}
										</td>
										<td className="border border-gray-200 px-4 py-2">
											{user.email}
										</td>
										<td className="border border-gray-200 px-4 py-2 capitalize">
											{user.role}
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* Access full query state if needed */}
						{query.isFetching && (
							<p className="text-sm text-gray-500 mt-2">Updating…</p>
						)}
					</div>
				)}
			</Fetcher>
		</div>
	);
}

/**
 * Advanced example: Composing additional options
 */
export function UsersWithComposedOptions() {
	return (
		<Fetcher
			queryOptions={api.users.$get.queryOptions({})}
			options={{
				// Add options specific to this component
				staleTime: 60_000, // 1 minute
				retry: 3,
				// Transform the data with select
				select: (response) => ({
					...response,
					data: response.data?.filter((u) => u.role === "admin") ?? [],
				}),
			}}
			fallback={<div>Loading admin users…</div>}
		>
			{(response) => (
				<div>
					<h2 className="text-xl font-semibold mb-4">Admin Users Only</h2>
					<ul className="space-y-2">
						{response.data?.map((user) => (
							<li key={user.id} className="p-2 bg-gray-50 rounded">
								{user.firstName} {user.lastName} - {user.email}
							</li>
						))}
					</ul>
				</div>
			)}
		</Fetcher>
	);
}
