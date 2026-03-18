import { createApp } from "@repo/core/lib";
import type { AppBinding } from "~/types";
export function createHonoRouter() {
	return createApp<AppBinding>();
}

export function createHonoApp() {
	return createHonoRouter();
}
