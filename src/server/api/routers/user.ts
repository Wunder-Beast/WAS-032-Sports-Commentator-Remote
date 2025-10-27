import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { isSuperAdmin } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
	getUsers: protectedProcedure.query(async ({ ctx }) => {
		// Check if the current user is an admin or super admin
		if (
			ctx.session.user.role !== "admin" &&
			!isSuperAdmin(ctx.session.user.role)
		) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only admins can view users",
			});
		}

		return ctx.db.query.users.findMany({
			orderBy: (users, { desc }) => desc(users.emailVerified),
		});
	}),

	createAdmin: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email address"),
				role: z.enum(["user", "admin", "super"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if the current user is an admin or super admin
			if (
				ctx.session.user.role !== "admin" &&
				!isSuperAdmin(ctx.session.user.role)
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only admins can create other users",
				});
			}

			// Only super admins can create super admins
			if (input.role === "super" && !isSuperAdmin(ctx.session.user.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only super admins can create super admins",
				});
			}

			// Check if user with this email already exists
			const existingUser = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, input.email),
			});

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A user with this email already exists",
				});
			}

			// Create the new user with specified role
			const [newUser] = await ctx.db
				.insert(users)
				.values({
					name: input.name,
					email: input.email,
					role: input.role,
				})
				.returning();

			return newUser;
		}),

	updateUser: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1, "Name is required").optional(),
				role: z.enum(["user", "admin", "super"]).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if the current user is an admin or super admin
			if (
				ctx.session.user.role !== "admin" &&
				!isSuperAdmin(ctx.session.user.role)
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only admins can update users",
				});
			}

			// Get the target user to check their role
			const targetUser = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			// Prevent users from updating themselves
			if (input.id === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot update your own account",
				});
			}

			// Only super admins can edit super admins
			if (targetUser.role === "super" && !isSuperAdmin(ctx.session.user.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only super admins can edit super admins",
				});
			}

			// Only super admins can set someone to super admin role
			if (input.role === "super" && !isSuperAdmin(ctx.session.user.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only super admins can create super admins",
				});
			}

			const [updatedUser] = await ctx.db
				.update(users)
				.set({
					...(input.name && { name: input.name }),
					...(input.role && { role: input.role }),
				})
				.where(eq(users.id, input.id))
				.returning();

			if (!updatedUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			return updatedUser;
		}),

	deleteUser: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if the current user is an admin or super admin
			if (
				ctx.session.user.role !== "admin" &&
				!isSuperAdmin(ctx.session.user.role)
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only admins can delete users",
				});
			}

			// Get the target user to check their role
			const targetUser = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			// Prevent users from deleting themselves
			if (input.id === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot delete your own account",
				});
			}

			// Only super admins can delete super admins
			if (targetUser.role === "super" && !isSuperAdmin(ctx.session.user.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only super admins can delete super admins",
				});
			}

			const [deletedUser] = await ctx.db
				.delete(users)
				.where(eq(users.id, input.id))
				.returning();

			if (!deletedUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			return { success: true, deletedUser };
		}),
});
