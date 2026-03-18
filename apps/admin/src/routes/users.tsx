import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "#/lib/api";

export const Route = createFileRoute("/users")({
	component: UsersPage,
});

export function UsersPage() {
	const { data, isLoading, isError } = useQuery(
		api.users.$get.queryOptions({}),
	);

	if (isLoading) {
		return (
			<div className="p-8">
				<p className="text-gray-500">Loading users…</p>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="p-8">
				<p className="text-red-500">Failed to load users.</p>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">Users</h1>
			<table className="w-full border-collapse border border-gray-200 rounded-lg">
				<thead className="bg-gray-50">
					<tr>
						<th className="border border-gray-200 px-4 py-2 text-left">Name</th>
						<th className="border border-gray-200 px-4 py-2 text-left">Email</th>
						<th className="border border-gray-200 px-4 py-2 text-left">Role</th>
					</tr>
				</thead>
				<tbody>
					{data.data?.map((user) => (
						<tr key={user.id} className="hover:bg-gray-50">
							<td className="border border-gray-200 px-4 py-2">
								{user.firstName} {user.lastName}
							</td>
							<td className="border border-gray-200 px-4 py-2">{user.email}</td>
							<td className="border border-gray-200 px-4 py-2 capitalize">
								{user.role}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
