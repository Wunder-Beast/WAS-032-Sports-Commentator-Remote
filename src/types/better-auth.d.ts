import type {} from "better-auth";

declare module "better-auth" {
	interface User {
		role: "user" | "admin" | "super";
	}

	interface Session {
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
	}
}

declare module "better-auth/react" {
	interface Session {
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
	}
}
