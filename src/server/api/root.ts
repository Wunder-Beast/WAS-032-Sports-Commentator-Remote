import { leadRouter } from "@/server/api/routers/lead";
import { leadFilesRouter } from "@/server/api/routers/leadFiles";
import { userRouter } from "@/server/api/routers/user";
import { utilityRouter } from "@/server/api/routers/utility";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	lead: leadRouter,
	leadFiles: leadFilesRouter,
	user: userRouter,
	utility: utilityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
