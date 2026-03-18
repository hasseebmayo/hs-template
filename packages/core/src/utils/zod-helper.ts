import { z } from "@hono/zod-openapi";
export type ApiSchema =
	| z.ZodTypeAny // Matches any Zod schema
	| z.ZodUnion<z.ZodTypeAny[]>
	| z.ZodObject<Record<string, z.ZodTypeAny>>
	| z.ZodArray<z.ZodTypeAny>;
export type ZodSchema = ApiSchema;

export function createApiResponseSchema(schema?: ApiSchema) {
	const baseSchema = z.object({
		message: z.string().openapi({ description: "Response message" }),
		meta: z.object({
			time: z.iso.datetime(),
			requestId: z.string(),
		}),
	});

	if (!schema) {
		return baseSchema;
	}

	return z
		.object({
			message: z.string().openapi({ description: "Response message" }),
			meta: z.object({
				time: z.iso.datetime(),
				requestId: z.string(),
			}),
			data: schema,
		})
		.openapi({ description: "Response with data" });
}
