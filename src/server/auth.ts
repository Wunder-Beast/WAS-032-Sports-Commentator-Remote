import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { desc, eq } from "drizzle-orm";
import { env } from "@/env.js";
import { db } from "./db";
import * as schema from "./db/schema";

// Custom plugin to automatically promote Google OAuth users to super admin
const superAdminPlugin = {
	id: "super-admin",
	hooks: {
		after: [
			{
				matcher(context) {
					return context.path?.startsWith("/callback/");
				},
				async handler(context) {
					const url = context.request?.url || "";
					const isGoogle =
						url.includes("callback/google") || url.includes("google");

					if (isGoogle) {
						// Query the most recent user with a Google account
						const recentGoogleUsers = await db
							.select({ userId: schema.account.userId })
							.from(schema.account)
							.where(eq(schema.account.providerId, "google"))
							.orderBy(desc(schema.account.createdAt))
							.limit(1);

						if (recentGoogleUsers.length > 0) {
							const userId = recentGoogleUsers[0]?.userId;

							if (userId) {
								// Set Google OAuth users to super admin role
								await db
									.update(schema.user)
									.set({ role: "super" })
									.where(eq(schema.user.id, userId));
							}
						}
					}

					return context;
				},
			},
		],
	},
} satisfies BetterAuthPlugin;

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		requireEmailVerification: false,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "user",
				input: false,
			},
		},
	},
	plugins: [superAdminPlugin],
});

// Helper function to get session with user data
export async function getServerSession(): Promise<{
	session: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
	user: {
		id: string;
		email: string;
		emailVerified: boolean;
		name: string;
		image?: string | null;
		createdAt: Date;
		updatedAt: Date;
		role: "user" | "admin" | "super";
	};
} | null> {
	const { headers } = await import("next/headers");
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session as Session;
}

// Type for the session with user data
export type Session = Awaited<ReturnType<typeof getServerSession>>;
