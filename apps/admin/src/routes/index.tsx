import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
			<nav>
				<Link
					to="/users"
					className="text-blue-600 hover:underline font-medium"
				>
					View Users →
				</Link>
			</nav>
		</div>
	);
}
