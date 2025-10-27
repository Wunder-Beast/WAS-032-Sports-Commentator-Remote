import { TRPCError } from "@trpc/server";
import { desc, sql } from "drizzle-orm";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { insertLeadSchema, leads } from "@/server/db/schema";

export const leadRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.leads.findMany({
			orderBy: desc(leads.id),
		});
	}),
	create: publicProcedure
		.input(insertLeadSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await ctx.db
					.insert(leads)
					.values({
						firstName: input.firstName,
						lastName: input.lastName,
						email: input.email,
						phone: input.phone,
						agePassed: input.agePassed,
						optIn: input.optIn,
						terms: input.terms,
						location: input.location,
					})
					.returning();

				return result[0];
				// biome-ignore lint/suspicious/noExplicitAny: unknown type
			} catch (error: any) {
				if (error.message?.includes("UNIQUE constraint failed")) {
					if (error.message.includes("email")) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "An account with this email address already exists.",
						});
					}
					if (error.message.includes("x_handle")) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "This X handle is already taken.",
						});
					}
					throw new TRPCError({
						code: "CONFLICT",
						message: "A record with this information already exists.",
					});
				}
				throw error;
			}
		}),
	getByLocation: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db
			.select({
				loc1: sql<number>`cast(count(location = 'location 1' OR NULL) as int)`,
				loc2: sql<number>`cast(count(location = 'location 2' OR NULL) as int)`,
				loc3: sql<number>`cast(count(location = 'location 3' OR NULL) as int)`,
			})
			.from(leads);
	}),
});
