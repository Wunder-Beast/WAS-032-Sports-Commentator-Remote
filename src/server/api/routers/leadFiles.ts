import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/env";
import { generateVideoSignedUrl, S3FileNotFoundError } from "@/lib/s3";
import {
	isTwilioConfigured,
	sendVideoRejectedSms,
	sendVideoShareSms,
} from "@/lib/sms";
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
				with: { lead: true },
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

			if (env.ENABLE_SMS && isTwilioConfigured() && file.lead?.phone) {
				try {
					if (input.status === "approved") {
						if (env.SMS_BASE_URL) {
							const baseUrl = env.SMS_BASE_URL.replace(/\/$/, "");
							const shareUrl = `${baseUrl}/s/${file.id}`;
							await sendVideoShareSms(file.lead.phone, shareUrl);
							await ctx.db
								.update(leadFiles)
								.set({ smsSentAt: new Date(), smsError: null })
								.where(eq(leadFiles.id, input.id));
						}
					} else {
						await sendVideoRejectedSms(file.lead.phone);
						await ctx.db
							.update(leadFiles)
							.set({ smsSentAt: new Date(), smsError: null })
							.where(eq(leadFiles.id, input.id));
					}
				} catch (error) {
					console.error("[moderate] Failed to auto-send SMS:", error);
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					await ctx.db
						.update(leadFiles)
						.set({ smsError: errorMessage })
						.where(eq(leadFiles.id, input.id));
				}
			}

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
				const downloadUrl = await generateVideoSignedUrl(
					file.remoteFilePath,
					3600,
					true,
				);
				return {
					id: file.id,
					moderationStatus: file.moderationStatus,
					videoUrl: url,
					downloadUrl: downloadUrl,
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
