import type { z } from "@hono/zod-openapi";
import type { CreateUserSchema, UserResponseSchema } from "./users.schema";

type User = z.infer<typeof UserResponseSchema>;
type CreateUser = z.infer<typeof CreateUserSchema>;

// In-memory store as a working example (no database required)
const users: User[] = [
	{
		id: "550e8400-e29b-41d4-a716-446655440000",
		email: "alice@example.com",
		firstName: "Alice",
		lastName: "Smith",
		role: "admin",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "550e8400-e29b-41d4-a716-446655440001",
		email: "bob@example.com",
		firstName: "Bob",
		lastName: "Jones",
		role: "user",
		createdAt: "2024-01-02T00:00:00.000Z",
		updatedAt: "2024-01-02T00:00:00.000Z",
	},
];

export const usersService = {
	findAll(): User[] {
		return users;
	},

	findById(id: string): User | undefined {
		return users.find((u) => u.id === id);
	},

	create(data: CreateUser): User {
		const user: User = {
			id: crypto.randomUUID(),
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			role: data.role,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		users.push(user);
		return user;
	},
};
