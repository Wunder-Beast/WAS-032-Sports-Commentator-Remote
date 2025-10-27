import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	sqliteTableCreator,
	text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type { AdapterAccount } from "next-auth/adapters";
import { ulid } from "ulid";
import { z } from "zod";
import { env } from "@/env";
import { phone } from "@/lib/utils";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
	(name) => `was-032_${env.NEXT_PUBLIC_DB_ENV}_${name}`,
);

export const leads = createTable("leads", {
	id: text("id", { length: 30 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid()),
	firstName: text("firstName").notNull(),
	lastName: text("lastName").notNull(),
	email: text("email").notNull().unique(),
	phone: text("phone").unique(),
	agePassed: integer("agePassed", { mode: "boolean" }).default(false),
	optIn: integer("optIn", { mode: "boolean" }).default(false),
	terms: integer("terms", { mode: "boolean" }).default(false),
	play: integer("play").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
		() => new Date(),
	),
});

export type SelectLead = InferSelectModel<typeof leads>;

export const insertLeadSchema = createInsertSchema(leads, {
	firstName: z.string().min(1, { message: "First Name is required." }),
	lastName: z.string().min(1, { message: "Last Name is required." }),
	email: z.string().email().min(1, { message: "Email is required." }),
	phone: phone(z.string()).optional(),
	terms: z.boolean().refine((val) => val === true, {
		message: "Please read and accept the terms and conditions",
	}),
}).refine(
	(schema) => {
		if (schema.agePassed) {
			return schema.phone && schema.phone.length > 0;
		}

		return true;
	},
	{ message: "Phone number is required." },
);

export const insertManyLeadSchema = z.array(insertLeadSchema);

export const leadsRelations = relations(leads, ({ many }) => ({
	files: many(leadFiles),
}));

export const leadFiles = createTable("lead_files", {
	id: text("id", { length: 30 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid()),
	leadId: text("lead_id").notNull(),
	play: integer("play").notNull(),
	fileName: text("file_name", { length: 255 }).notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type", { length: 100 }).notNull(),
	remoteFilePath: text("remote_path", { length: 1024 }).unique(),
	uploadStatus: text("upload_status", {
		enum: ["pending", "completed", "failed"],
	})
		.default("pending")
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
		() => new Date(),
	),
});

export const leadFilesRelations = relations(leadFiles, ({ one }) => ({
	lead: one(leads, {
		fields: [leadFiles.leadId],
		references: [leads.id],
	}),
}));

export const insertLeadFileSchema = createInsertSchema(leadFiles);

/**
 * Below this is for NextAuth / AuthJS
 * Do not modify below this
 */

export const users = createTable("user", {
	id: text("id", { length: 30 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid()),
	name: text("name"),
	email: text("email").unique().notNull(),
	emailVerified: integer("emailVerified", { mode: "timestamp" }),
	role: text("role", { enum: ["user", "admin", "super"] })
		.default("user")
		.notNull(),
	image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id),
		type: text("type").$type<AdapterAccount["type"]>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
		userIdIdx: index("account_user_id_idx").on(account.userId),
	}),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	{
		sessionToken: text("session_token").notNull().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id),
		expires: integer("expires", { mode: "timestamp" }).notNull(),
	},
	(session) => ({ userIdIdx: index("session_user_id_idx").on(session.userId) }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: integer("expires", { mode: "timestamp" }).notNull(),
	},
	(vt) => ({ compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }) }),
);
