import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string().min(32)
				: z.string().min(32).optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		EMAIL_SERVER_HOST: z.string().min(1),
		EMAIL_SERVER_USER: z.string().min(1),
		EMAIL_SERVER_PASSWORD: z.string().min(1),
		EMAIL_SERVER_PORT: z.coerce.number().min(1),
		EMAIL_FROM: z.string(),
		API_KEY: z.string(),
		AWS_REGION: z.string().min(1),
		AWS_ACCESS_KEY_ID: z.string().min(1),
		AWS_SECRET_ACCESS_KEY: z.string().min(1),
		S3_BUCKET_NAME: z.string().min(1),
		S3_ENDPOINT: z.string().optional(),
		S3_FORCE_PATH_STYLE: z
			.string()
			.transform((val) => val === "true")
			.optional(),
		SMS_BASE_URL: z.string().url().optional(),
		TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
		TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
		TWILIO_MESSAGING_SERVICE_SID: z.string().min(1).optional(),
		ENABLE_SMS: z
			.string()
			.transform((val) => val === "true")
			.optional(),
	},
	client: {
		NEXT_PUBLIC_DB_ENV: z
			.enum(["development", "staging", "production"])
			.default("development"),
		NEXT_PUBLIC_APP_URL: z.string().url(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
		EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
		EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
		EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
		EMAIL_FROM: process.env.EMAIL_FROM,
		API_KEY: process.env.API_KEY,
		AWS_REGION: process.env.AWS_REGION,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
		S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
		S3_ENDPOINT: process.env.S3_ENDPOINT,
		S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
		SMS_BASE_URL: process.env.SMS_BASE_URL,
		TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
		TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
		TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
		ENABLE_SMS: process.env.ENABLE_SMS,
		NEXT_PUBLIC_DB_ENV: process.env.NEXT_PUBLIC_DB_ENV,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
