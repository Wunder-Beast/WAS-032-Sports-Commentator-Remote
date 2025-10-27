import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { insertLeadFileSchema, leadFiles } from "@/server/db/schema";

export const leadFilesRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.leadFiles.findMany({
			with: { lead: true },
			orderBy: desc(leadFiles.createdAt),
		});
	}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const file = await ctx.db.query.leadFiles.findFirst({
				where: eq(leadFiles.id, input.id),
			});

			if (!file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			// Delete from database
			await ctx.db.delete(leadFiles).where(eq(leadFiles.id, input.id));

			return { success: true };
		}),
	create: publicProcedure
		.input(insertLeadFileSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.insert(leadFiles).values({
				leadId: input.leadId,
				remoteFilePath: input.remoteFilePath,
				fileName: input.fileName || "unknown",
				fileSize: input.fileSize || 0,
				mimeType: input.mimeType || "application/octet-stream",
				uploadStatus: "completed",
			});
		}),
});
