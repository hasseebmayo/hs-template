import { createHonoRouter } from "~/lib/router";
import { USER_HANDLERS } from "./users.handlers";
import { USER_ROUTES } from "./users.routes";

const usersRouter = createHonoRouter()
	.openapi(USER_ROUTES.list, USER_HANDLERS.list)
	.openapi(USER_ROUTES.getById, USER_HANDLERS.getById)
	.openapi(USER_ROUTES.create, USER_HANDLERS.create);

export default usersRouter;
