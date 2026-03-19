import type { AuthClient } from "better-auth/client";
import { createAuthClient } from "better-auth/client";
export function createAuthClientInstance<T>(options: AuthClient<T>) {
	return createAuthClient();
}
