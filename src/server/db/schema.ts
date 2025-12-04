import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { ulid } from "ulid";
import { z } from "zod";
import { env } from "@/env";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
	(name) => `was-026_${env.NEXT_PUBLIC_DB_ENV}_${name}`,
);

export const leads = createTable("leads", {
	id: text("id", { length: 30 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid()),
	firstName: text("first_name"),
	lastName: text("last_name"),
	email: text("email").unique(),
	phone: text("phone").notNull().unique(),
	terms: integer("terms", { mode: "boolean" }).default(false),
	survey: integer("survey", { mode: "boolean" }).default(false),
	promotions: integer("promotions", { mode: "boolean" }).default(false),
	agePassed: integer("agePassed", { mode: "boolean" }).default(false),
	play: integer("play"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date()),
});

export type SelectLead = InferSelectModel<typeof leads>;

export const leadsRelations = relations(leads, ({ many }) => ({
	files: many(leadFiles),
}));

export const leadFiles = createTable("lead_files", {
	id: text("id", { length: 30 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => ulid()),
	leadId: text("lead_id")
		.notNull()
		.references(() => leads.id),
	localFilePath: text("local_file_path"),
	remoteFilePath: text("remote_file_path"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date()),
});

export const leadFilesRelations = relations(leadFiles, ({ one }) => ({
	lead: one(leads, { fields: [leadFiles.leadId], references: [leads.id] }),
}));

export const insertLeadSchema = createInsertSchema(leads, {
	firstName: z
		.string()
		.min(1, { message: "First name is required" })
		.optional()
		.or(z.literal("")),
	lastName: z
		.string()
		.min(1, { message: "Last name is required" })
		.optional()
		.or(z.literal("")),
	email: z.string().email().optional().or(z.literal("")),
	phone: z
		.string()
		.refine(
			(value) => {
				// Empty is not allowed since phone is required
				if (!value || value === "") return false;
				// Must have exactly 10 digits for US numbers
				const digitsOnly = value.replace(/\D/g, "");
				if (value.startsWith("+1")) {
					return digitsOnly.length === 11; // +1 + 10 digits
				}
				return digitsOnly.length === 10;
			},
			{ message: "Phone number must be 10 digits" },
		)
		.refine(isValidPhoneNumber, "Please specify a valid phone number")
		.transform((value) => parsePhoneNumber(value).number.toString()),
	terms: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
});

export const insertManyLeadSchema = z.array(insertLeadSchema);

/**
 * Below this is for BetterAuth
 * Schema follows BetterAuth conventions with custom role field
 */
export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.default(false)
		.notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role", { enum: ["user", "admin", "super"] })
		.default("user")
		.notNull(),
});

export const session = createTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp_ms",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp_ms",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = createTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
