import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setGenerator("package", {
		description: "Create a new package",

		prompts: [
			{
				type: "input",
				name: "name",
				message: "Package name (e.g., auth-core):",
			},
		],

		actions: [
			{
				type: "addMany",
				destination: "packages/{{snakeCase name}}",
				// Paths are relative to the generators directory
				base: "templates/package",
				templateFiles: "templates/package/**",
			},
		],
	});
}
