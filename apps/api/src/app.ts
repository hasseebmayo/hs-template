import { usersRouter } from "~/routes/users";
import type { AppOpenAPI } from "~/types";

export function registerRoutes(app: AppOpenAPI) {
	return app.route("/users", usersRouter);
}
