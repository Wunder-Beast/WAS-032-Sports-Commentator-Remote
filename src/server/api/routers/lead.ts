import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { insertLeadSchema, leads } from "@/server/db/schema";

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
			if (!input.email || input.email === "") {
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
						play: input.play,
					})
					.returning();

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
					const errorText =
						rootCause.message || error.cause?.message || error.message || "";
					if (errorText.includes("email")) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "This email address is already registered.",
						});
					}
					if (errorText.includes("phone")) {
						// Check if existing lead has no email (from in-person event)
						// If so, allow them to complete registration by updating the lead
						const existingLead = await ctx.db.query.leads.findFirst({
							where: (leads, { eq }) => eq(leads.phone, input.phone),
						});

						if (existingLead && !existingLead.email && input.email) {
							// Update the existing lead with the email
							const updated = await ctx.db
								.update(leads)
								.set({
									email: input.email,
									firstName: input.firstName,
									lastName: input.lastName,
									agePassed: input.agePassed,
									terms: input.terms,
									survey: input.survey,
									promotions: input.promotions,
									play: input.play,
								})
								.where(eq(leads.id, existingLead.id))
								.returning();

							if (!updated[0]) {
								throw new TRPCError({
									code: "INTERNAL_SERVER_ERROR",
									message: "Failed to update lead",
								});
							}

							return updated[0];
						}

						throw new TRPCError({
							code: "CONFLICT",
							message: "You're already registered, thank you!",
						});
					}
					throw new TRPCError({
						code: "CONFLICT",
						message: "This information is already registered.",
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
});
