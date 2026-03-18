import { z } from "@hono/zod-openapi";

export const CreateUserSchema = z
	.object({
		email: z.string().email().openapi({ example: "john@example.com" }),
		firstName: z.string().min(1).openapi({ example: "John" }),
		lastName: z.string().min(1).openapi({ example: "Doe" }),
		role: z.enum(["admin", "user"]).default("user"),
	})
	.openapi("CreateUser");

export const UserResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	role: z.enum(["admin", "user"]),
	createdAt: z.string(),
	updatedAt: z.string(),
});
