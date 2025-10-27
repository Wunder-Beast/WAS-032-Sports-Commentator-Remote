import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().url(),
		NEXTAUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		NEXTAUTH_URL: z.preprocess(
			(str) => process.env.VERCEL_URL ?? str,
			process.env.VERCEL ? z.string() : z.string().url(),
		),
		EMAIL_SERVER_HOST: z.string().min(1),
		EMAIL_SERVER_USER: z.string().min(1),
		EMAIL_SERVER_PASSWORD: z.string().min(1),
		EMAIL_SERVER_PORT: z.coerce.number().min(1),
		EMAIL_FROM: z.string(),
		API_KEY: z.string(),
	},
	client: {
		NEXT_PUBLIC_DB_ENV: z
			.enum(["development", "staging", "production"])
			.default("development"),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		NEXT_PUBLIC_DB_ENV: process.env.NEXT_PUBLIC_DB_ENV,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
		EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
		EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
		EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
		EMAIL_FROM: process.env.EMAIL_FROM,
		API_KEY: process.env.API_KEY,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
