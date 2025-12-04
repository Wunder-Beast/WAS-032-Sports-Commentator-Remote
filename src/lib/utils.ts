import { type ClassValue, clsx } from "clsx";
import { type ilike as _ilike, sql } from "drizzle-orm";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function phone(schema: z.ZodString) {
	return schema
		.refine((value) => {
			// Ensure we have exactly 10 digits for US numbers
			const digitsOnly = value.replace(/\D/g, "");
			if (value.startsWith("+1")) {
				return digitsOnly.length === 11; // +1 + 10 digits
			}
			return digitsOnly.length === 10;
		}, "Phone number must be 10 digits.")
		.refine(isValidPhoneNumber, "Please specify a valid phone number.")
		.transform((value) => parsePhoneNumber(value).number.toString());
}

const contactNumber = phone(z.string());
export type ContactNumber = z.infer<typeof contactNumber>;

export function isSuperAdmin(role: string | null | undefined): boolean {
	return role === "super";
}

export function ilike(
	column: Parameters<typeof _ilike>[0],
	value: Parameters<typeof _ilike>[1],
) {
	return sql`${column} LIKE ${value} COLLATE NOCASE`;
}
