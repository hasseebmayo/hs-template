import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		"lib/index": "src/lib/index.ts",
		"routing/index": "src/routing/index.ts",
		"http/index": "src/http/index.ts",
		"utils/index": "src/utils/index.ts",
		"status/index": "src/status/index.ts",
		"openapi/index": "src/openapi/index.ts",
		"middleware/index": "src/middleware/index.ts",
		"phrases/index": "src/phrases/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: false,
	outDir: "dist",
	outExtensions: () => ({
		js: ".js",
		dts: ".d.ts",
	}),
});
