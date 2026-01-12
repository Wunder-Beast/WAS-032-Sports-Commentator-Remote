import { asc, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { leadFiles, leads } from "@/server/db/schema";

export const statsRouter = createTRPCRouter({
	leadsPerDay: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db
			.select({
				date: sql<string>`date(datetime(created_at, 'unixepoch')) AS date`,
				count: sql<number>`cast(count(id) as int)`,
			})
			.from(leads)
			.orderBy(asc(sql`date`))
			.groupBy(sql`date`);
	}),

	leadFilesPerDay: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db
			.select({
				date: sql<string>`date(datetime(created_at, 'unixepoch')) AS date`,
				count: sql<number>`cast(count(id) as int)`,
			})
			.from(leadFiles)
			.orderBy(asc(sql`date`))
			.groupBy(sql`date`);
	}),

	playCountsPerDay: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db
			.select({
				date: sql<string>`date(datetime(created_at, 'unixepoch')) AS date`,
				bbq: sql<number>`cast(count(play = 0 OR NULL) as int)`,
				jumpPass: sql<number>`cast(count(play = 1 OR NULL) as int)`,
				theHero: sql<number>`cast(count(play = 2 OR NULL) as int)`,
			})
			.from(leadFiles)
			.orderBy(asc(sql`date`))
			.groupBy(sql`date`);
	}),

	leadsGroupedByFileCount: protectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.db
			.select({
				fileCount: sql<number>`cast(count(${leadFiles.id}) as int)`,
				leadCount: sql<number>`1`,
			})
			.from(leads)
			.leftJoin(leadFiles, sql`${leads.id} = ${leadFiles.leadId}`)
			.groupBy(leads.id);

		const grouped = result.reduce(
			(acc, row) => {
				const fileCount = row.fileCount;
				const key = String(fileCount);
				acc[key] = (acc[key] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		return Object.entries(grouped)
			.map(([fileCount, leadCount]) => ({
				fileCount: Number.parseInt(fileCount, 10),
				leadCount,
			}))
			.sort((a, b) => a.fileCount - b.fileCount);
	}),
});
