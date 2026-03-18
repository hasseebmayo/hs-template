import type { ZodSchema } from "zod";

import jsonContent from "./json-content.js";

const jsonContentRequired = <T extends ZodSchema>(
	schema: T,
	description: string,
) => ({
	...jsonContent(schema, description),
	required: true,
});

export default jsonContentRequired;
