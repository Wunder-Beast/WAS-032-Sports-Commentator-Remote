import { readFile } from "node:fs/promises";
import path from "node:path";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { createTRPCRouter, superAdminProcedure } from "@/server/api/trpc";

export const utilityRouter = createTRPCRouter({
	downloadDatabase: superAdminProcedure.mutation(async () => {
		try {
			const databaseUrl = env.DATABASE_URL;
			let dbPath: string;

			if (databaseUrl.startsWith("file:")) {
				dbPath = databaseUrl.replace("file:", "");
			} else if (databaseUrl.includes("://")) {
				const urlPath = databaseUrl.split("://")[1];
				if (urlPath) {
					dbPath = urlPath.split("?")[0] ?? "";
				} else {
					throw new Error("Invalid database URL format");
				}
			} else {
				dbPath = databaseUrl;
			}

			if (!path.isAbsolute(dbPath)) {
				dbPath = path.resolve(process.cwd(), dbPath);
			}

			const fileBuffer = await readFile(dbPath);
			const base64 = fileBuffer.toString("base64");

			return {
				data: base64,
				filename: `database-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
			};
		} catch (error) {
			console.error("Database download error:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to download database",
			});
		}
	}),
});
