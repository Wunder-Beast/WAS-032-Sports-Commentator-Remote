import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateVideoSignedUrl, S3FileNotFoundError } from "@/lib/s3";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { leadFiles } from "@/server/db/schema";

export const leadFilesRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.leadFiles.findMany({
			with: { lead: true },
			orderBy: desc(leadFiles.createdAt),
		});
	}),

	getVideoUrl: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const file = await ctx.db.query.leadFiles.findFirst({
				where: eq(leadFiles.id, input.id),
			});

			if (!file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			if (!file.remoteFilePath) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No remote file path available",
				});
			}

			try {
				const url = await generateVideoSignedUrl(file.remoteFilePath, 3600);
				return { url };
			} catch (error) {
				if (error instanceof S3FileNotFoundError) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Video file not found in storage",
					});
				}
				throw error;
			}
		}),

	getByLeadId: protectedProcedure
		.input(z.object({ leadId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.query.leadFiles.findMany({
				where: eq(leadFiles.leadId, input.leadId),
				orderBy: desc(leadFiles.createdAt),
			});
		}),

	getModerationQueue: protectedProcedure
		.input(
			z.object({
				status: z.enum(["pending", "approved", "rejected"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (input.status) {
				return await ctx.db.query.leadFiles.findMany({
					where: eq(leadFiles.moderationStatus, input.status),
					with: { lead: true },
					orderBy: desc(leadFiles.createdAt),
				});
			}
			return await ctx.db.query.leadFiles.findMany({
				with: { lead: true },
				orderBy: desc(leadFiles.createdAt),
			});
		}),

	moderate: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["approved", "rejected"]),
				notes: z.string().optional(),
			}),
		)
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

			const updated = await ctx.db
				.update(leadFiles)
				.set({
					moderationStatus: input.status,
					moderatedAt: new Date(),
					moderatedBy: ctx.session.user.id,
					moderationNotes: input.notes || null,
				})
				.where(eq(leadFiles.id, input.id))
				.returning();

			return updated[0];
		}),

	getPublicFileInfo: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const file = await ctx.db.query.leadFiles.findFirst({
				where: eq(leadFiles.id, input.id),
			});

			if (!file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				});
			}

			if (file.moderationStatus !== "approved") {
				return {
					id: file.id,
					moderationStatus: file.moderationStatus,
					videoUrl: null,
				};
			}

			if (!file.remoteFilePath) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No remote file path available",
				});
			}

			try {
				const url = await generateVideoSignedUrl(file.remoteFilePath, 3600);
				return {
					id: file.id,
					moderationStatus: file.moderationStatus,
					videoUrl: url,
				};
			} catch (error) {
				if (error instanceof S3FileNotFoundError) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Video file not found in storage",
					});
				}
				throw error;
			}
		}),
});
