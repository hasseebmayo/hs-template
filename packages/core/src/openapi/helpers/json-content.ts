import type { ZodSchema } from "zod";

const jsonContent = <T extends ZodSchema>(schema: T, description: string) => ({
	content: {
		"application/json": {
			schema,
		},
	},
	description,
});

export default jsonContent;
