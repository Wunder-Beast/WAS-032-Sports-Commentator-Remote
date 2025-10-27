import { type ClassValue, clsx } from "clsx";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function phone(schema: z.ZodString) {
	return schema
		.refine(
			isValidPhoneNumber,
			"Please specify a valid phone number (include the international prefix).",
		)
		.transform((value) => parsePhoneNumber(value).number.toString());
}

const contactNumber = phone(z.string());
export type ContactNumber = z.infer<typeof contactNumber>;

export function isSuperAdmin(role: string | null | undefined): boolean {
	return role === "super";
}
