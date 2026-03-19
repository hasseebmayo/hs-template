import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@repo/prisma";
import { betterAuth } from "better-auth/minimal";
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
});
