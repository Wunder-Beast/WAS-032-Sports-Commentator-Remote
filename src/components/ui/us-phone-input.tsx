import * as React from "react";
import { PatternFormat, type PatternFormatProps } from "react-number-format";
import { z } from "zod";
import { cn } from "@/lib/utils";

export interface USPhoneInputProps
	extends Omit<PatternFormatProps, "format" | "mask" | "onValueChange"> {
	onValueChange?: (value: string) => void;
	onComplete?: () => void;
}

const USPhoneInput = React.forwardRef<HTMLInputElement, USPhoneInputProps>(
	({ className, onValueChange, onComplete, onBlur, value, ...props }, ref) => {
		// Strip +1 prefix if present for display
		const displayValue = value?.toString().replace(/^\+1/, "") ?? "";

		return (
			<PatternFormat
				format="(###) ###-####"
				getInputRef={ref}
				value={displayValue}
				onValueChange={(values) => {
					// Transform to E164 format (+1XXXXXXXXXX) when value changes
					const e164Value = values.value ? `+1${values.value}` : "";
					onValueChange?.(e164Value);

					// Trigger completion callback when 10 digits are entered
					if (values.value?.length === 10) {
						onComplete?.();
					}
				}}
				onBlur={onBlur}
				className={cn(
					"flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
					"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
					"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
					className,
				)}
				{...props}
			/>
		);
	},
);

USPhoneInput.displayName = "USPhoneInput";

// Zod validation schema for US phone numbers
export const usPhoneSchema = z
	.string()
	.regex(/^\d{10}$/, "Phone number must be 10 digits")
	.transform((val) => {
		// Format as (123) 456-7890 for display
		return `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6, 10)}`;
	});

// Alternative schema that keeps the raw 10-digit value
export const usPhoneSchemaRaw = z
	.string()
	.regex(/^\d{10}$/, "Phone number must be 10 digits");

export { USPhoneInput };
