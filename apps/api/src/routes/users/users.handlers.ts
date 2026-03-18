import HTTP_STATUS_CODES from "~/lib/status";
import type { HandlerMapFromRoutes } from "~/types";
import type { USER_ROUTES } from "./users.routes";
import { usersService } from "./users.services";

export const USER_HANDLERS: HandlerMapFromRoutes<typeof USER_ROUTES> = {
	list: async (c) => {
		const users = usersService.findAll();
		return c.json(
			{
				message: "Users retrieved",
				data: users,
				meta: {
					time: new Date().toISOString(),
					requestId: "123e4567-e89b-12d3-a456-426614174000",
				},
			},
			HTTP_STATUS_CODES.OK,
		);
	},

	getById: async (c) => {
		const { id } = c.req.valid("param");
		const user = usersService.findById(id);
		if (!user) {
			return c.json(
				{
					message: "User not found",
					meta: {
						time: new Date().toISOString(),
						requestId: "123e4567-e89b-12d3-a456-426614174000",
					},
				},
				HTTP_STATUS_CODES.NOT_FOUND,
			);
		}
		return c.json(
			{
				message: "User retrieved",
				data: user,
				meta: {
					time: new Date().toISOString(),
					requestId: "123e4567-e89b-12d3-a456-426614174000",
				},
			},
			HTTP_STATUS_CODES.OK,
		);
	},

	create: async (c) => {
		const body = c.req.valid("json");
		const user = usersService.create(body);
		return c.json(
			{
				message: "User created",
				data: user,
				meta: {
					time: new Date().toISOString(),
					requestId: "123e4567-e89b-12d3-a456-426614174000",
				},
			},
			HTTP_STATUS_CODES.CREATED,
		);
	},
};
