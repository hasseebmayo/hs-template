import { z } from "@hono/zod-openapi";
import type { ZodSchema } from "zod";

const getIssuePathExample = (schema: ZodSchema): Array<string | number> => {
	if (schema instanceof z.ZodObject) {
		const [firstField] = Object.keys(schema.shape);
		if (firstField) {
			return [firstField];
		}
	}

	return ["fieldName"];
};

const createErrorSchema = (schema: ZodSchema) =>
	z.object({
		success: z.boolean().openapi({ example: false }),
		error: z
			.object({
				issues: z.array(
					z.object({
						code: z.string(),
						path: z.array(z.union([z.string(), z.number()])),
						message: z.string().optional(),
					}),
				),
				name: z.string(),
			})
			.openapi({
				example: {
					name: "ZodError",
					issues: [
						{
							code: "invalid_type",
							path: getIssuePathExample(schema),
							message: "Expected string, received undefined",
						},
					],
				},
			}),
	});

export default createErrorSchema;
