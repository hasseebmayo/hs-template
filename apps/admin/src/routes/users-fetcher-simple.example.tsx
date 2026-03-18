import { Fetcher } from "@repo/ui/query";
import { api } from "#/lib/api";

/**
 * Example of using <Fetcher> in place of useQuery hook.
 *
 * Note: Due to type inference limitations in the RPC chain,
 * you need to handle the response shape explicitly.
 *
 * The API returns: { success: boolean, message: string, data: T }
 * But types currently show: { message: string }
 *
 * This is a known limitation with Hono's RPC type inference
 * when using Zod OpenAPI schemas.
 */
export function UsersPageExample() {
	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">Users</h1>

			<Fetcher
				queryOptions={api.users.$get.queryOptions({})}
				fallback={
					<div className="p-8">
						<p className="text-gray-500">Loading users…</p>
					</div>
				}
				renderError={(error) => (
					<div className="p-8">
						<p className="text-red-500">
							Failed to load users: {error.message}
						</p>
					</div>
				)}
			>
				{(response) => {
					// Type assertion needed due to RPC type inference limitations
					const data = response as unknown as {
						success: boolean;
						message: string;
						data: Array<{
							id: string;
							email: string;
							firstName: string;
							lastName: string;
							role: "admin" | "user";
							createdAt: string;
							updatedAt: string;
						}>;
					};

					return (
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
								{data.data?.map((user) => (
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
					);
				}}
			</Fetcher>
		</div>
	);
}
