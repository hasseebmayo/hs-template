import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Point Vite at source during dev so no prior build is required.
// TypeScript still uses the compiled dist via the exports `types` field.
const rpcAliases = {
	"@repo/rpc-client": path.resolve(
		__dirname,
		"../../packages/rpc-client/src/index.ts",
	),
	"@repo/query-rpc": path.resolve(
		__dirname,
		"../../packages/query-rpc/src/index.ts",
	),
};

const config = defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact(),
	],
	resolve: {
		alias: rpcAliases,
	},
	test: {
		environment: "jsdom",
		setupFiles: [],
		globals: true,
		alias: rpcAliases,
	},
});

export default config;
