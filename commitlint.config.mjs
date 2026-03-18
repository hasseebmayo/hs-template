export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// Allow additional custom types beyond conventional
		"type-enum": [
			2,
			"always",
			[
				"feat", // New feature
				"fix", // Bug fix
				"docs", // Documentation changes
				"style", // Code style/formatting (no logic change)
				"refactor", // Code refactoring (no feat/fix)
				"perf", // Performance improvements
				"test", // Adding or updating tests
				"build", // Build system or dependencies
				"ci", // CI/CD changes
				"chore", // Maintenance tasks
				"revert", // Revert previous commit
				"ui", // UI/UX changes
				"wip", // Work in progress
				"upgrade", // Dependency upgrades
			],
		],
		// Subject should not end with a period
		"subject-case": [2, "never", ["upper-case"]],
		// Max length for header
		"header-max-length": [2, "always", 100],
	},
};
