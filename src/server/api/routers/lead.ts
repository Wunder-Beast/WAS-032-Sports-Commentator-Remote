import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import { env } from "@/env";
import {
	isTwilioConfigured,
	sendVideoShareSms,
	TwilioNotConfiguredError,
} from "@/lib/sms";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { insertLeadSchema, leadFiles, leads } from "@/server/db/schema";

export const leadRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const allLeads = await ctx.db.query.leads.findMany({
			orderBy: desc(leads.id),
			with: {
				files: true,
			},
		});

		return allLeads.map((lead) => ({
			...lead,
			hasParticipated: lead.files.length > 0,
		}));
	}),
	create: publicProcedure
		.input(insertLeadSchema)
		.mutation(async ({ ctx, input }) => {
			// Enforce required fields for form submissions
			if (!input.firstName || input.firstName === "") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "First name is required",
				});
			}
			if (!input.lastName || input.lastName === "") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Last name is required",
				});
			}
			if (input.agePassed && (!input.email || input.email === "")) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Email is required",
				});
			}
			if (!input.terms) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You must accept the terms and conditions",
				});
			}

			try {
				console.log("play", input.play);
				const result = await ctx.db
					.insert(leads)
					.values({
						firstName: input.firstName,
						lastName: input.lastName,
						email: input.email || null,
						phone: input.phone,
						agePassed: input.agePassed,
						terms: input.terms,
						survey: input.survey,
						promotions: input.promotions,
						play: (input.play ?? 0) + 1,
					})
					.returning();

				console.log("created", result[0]);

				if (!result[0]) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create lead - no result returned",
					});
				}

				return result[0];
				// biome-ignore lint/suspicious/noExplicitAny: unknown type
			} catch (error: any) {
				if (error instanceof TRPCError) {
					throw error;
				}

				// Check for UNIQUE constraint - error can be nested in cause.cause
				const rootCause = error.cause?.cause || error.cause || error;
				const isUniqueConstraint =
					error.message?.includes("UNIQUE constraint failed") ||
					error.cause?.message?.includes("UNIQUE constraint failed") ||
					rootCause.message?.includes("UNIQUE constraint failed") ||
					rootCause.code === "SQLITE_CONSTRAINT_UNIQUE";

				if (isUniqueConstraint) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "You're already registered, thank you!",
					});
				}

				if (error.message?.includes("no such table")) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Database not initialized. Please run migrations.",
					});
				}

				if (
					error.message?.includes("connection") ||
					error.code === "ECONNREFUSED"
				) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Database connection failed. Please try again later.",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error.message ||
						"An unexpected error occurred while creating the lead.",
					cause: error,
				});
			}
		}),
	lookupByPhone: publicProcedure
		.input(
			z.object({
				phone: z
					.string()
					.min(1, { message: "Phone number is required" })
					.refine(
						(value) => {
							if (!value || value === "") return false;
							const digitsOnly = value.replace(/\D/g, "");
							if (value.startsWith("+1")) {
								return digitsOnly.length === 11;
							}
							return digitsOnly.length === 10;
						},
						{ message: "Phone number must be 10 digits" },
					)
					.refine(isValidPhoneNumber, "Please specify a valid phone number")
					.transform((value) => parsePhoneNumber(value).number.toString()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existingLead = await ctx.db.query.leads.findFirst({
				where: (leads, { eq }) => eq(leads.phone, input.phone),
			});

			if (!existingLead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found, please try again",
				});
			}

			return existingLead;
		}),
	updatePlay: publicProcedure
		.input(
			z.object({
				id: z.string(),
				play: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updated = await ctx.db
				.update(leads)
				.set({ play: input.play + 1 })
				.where(eq(leads.id, input.id))
				.returning();

			if (!updated[0]) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			return updated[0];
		}),
	forceSendSms: protectedProcedure
		.input(z.object({ leadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!isTwilioConfigured()) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Twilio credentials are not configured",
				});
			}

			const lead = await ctx.db.query.leads.findFirst({
				where: eq(leads.id, input.leadId),
			});

			if (!lead) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lead not found",
				});
			}

			if (!lead.phone) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Lead does not have a phone number",
				});
			}

			const latestFile = await ctx.db.query.leadFiles.findFirst({
				where: eq(leadFiles.leadId, input.leadId),
				orderBy: desc(leadFiles.createdAt),
			});

			if (!latestFile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No video files found for this lead",
				});
			}

			if (!env.SMS_BASE_URL) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "SMS_BASE_URL is not configured",
				});
			}

			const baseUrl = env.SMS_BASE_URL.replace(/\/$/, "");
			const shareUrl = `${baseUrl}/s/${latestFile.id}`;

			try {
				const messageSid = await sendVideoShareSms(lead.phone, shareUrl);
				return { success: true, messageSid };
			} catch (error) {
				console.error("[forceSendSms] Failed to send SMS:", error);
				if (error instanceof TwilioNotConfiguredError) {
					throw new TRPCError({
						code: "PRECONDITION_FAILED",
						message: "Twilio credentials are not configured",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send SMS",
				});
			}
		}),
});
