import { createAuthClient } from "better-auth/react";
import type { Session as BetterAuthSession } from "better-auth/types";
import { env } from "@/env.js";

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signOut, signUp } = authClient;

// Wrap useSession to properly type the role field
export const useSession = () => {
	const session = authClient.useSession();
	return session as typeof session & {
		data:
			| (BetterAuthSession & {
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
			  })
			| null;
	};
};
