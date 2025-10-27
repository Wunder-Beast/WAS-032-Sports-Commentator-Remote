import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
	type DefaultSession,
	getServerSession,
	type NextAuthOptions,
} from "next-auth";
import type { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env.js";
import { db } from "@/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "@/server/db/schema";

// import { users } from "@/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: "admin" | "user" | "super";
		} & DefaultSession["user"];
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		async redirect({ baseUrl }) {
			// Always redirect to dashboard after sign in
			return `${baseUrl}/dashboard`;
		},
		async session({ session, user }) {
			const dbUser = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, user.email),
			});

			return {
				...session,
				user: {
					...session.user,
					id: user.id,
					role: dbUser?.role,
				},
			};
		},
		async signIn({ user }) {
			return Boolean(
				await db.query.users.findFirst({
					// biome-ignore lint/style/noNonNullAssertion: required
					where: (users, { eq }) => eq(users.email, user.email!),
				}),
			);
		},
	},
	adapter: DrizzleAdapter(db, {
		// biome-ignore lint/suspicious/noExplicitAny: drizzle
		usersTable: users as any,
		// biome-ignore lint/suspicious/noExplicitAny: drizzle
		accountsTable: accounts as any,
		// biome-ignore lint/suspicious/noExplicitAny: drizzle
		sessionsTable: sessions as any,
		// biome-ignore lint/suspicious/noExplicitAny: drizzle
		verificationTokensTable: verificationTokens as any,
	}) as Adapter,
	providers: [
		EmailProvider({
			server: {
				host: env.EMAIL_SERVER_HOST,
				port: env.EMAIL_SERVER_PORT,
				auth: {
					user: env.EMAIL_SERVER_USER,
					pass: env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: env.EMAIL_FROM,
		}),
	],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
