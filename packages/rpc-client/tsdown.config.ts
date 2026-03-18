import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: false,
	outDir: "dist",
	external: ["hono/client"],
	outExtensions: () => ({
		js: ".js",
		dts: ".d.ts",
	}),
});
