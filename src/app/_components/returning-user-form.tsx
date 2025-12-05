"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { USPhoneInput } from "@/components/ui/us-phone-input";
import { api } from "@/trpc/react";

const phoneSchema = z.object({
	phone: z
		.string()
		.min(1, { message: "Phone number is required" })
		.refine(
			(value) => {
				if (!value || value === "") return false;
				const digitsOnly = value.replace(/\D/g, "");
				if (value.startsWith("+1")) {
					return digitsOnly.length === 11;
				}
				return digitsOnly.length === 10;
			},
			{ message: "Phone number must be 10 digits" },
		)
		.refine(isValidPhoneNumber, "Please specify a valid phone number")
		.transform((value) => parsePhoneNumber(value).number.toString()),
});

type PhoneFormValues = z.input<typeof phoneSchema>;

interface ReturningUserFormProps {
	onSuccess: (leadId: string) => void;
}

export function ReturningUserForm({ onSuccess }: ReturningUserFormProps) {
	const [serverError, setServerError] = useState<string | null>(null);

	const lookupByPhone = api.lead.lookupByPhone.useMutation({
		onSuccess: (data) => {
			setServerError(null);
			onSuccess(data.id);
		},
		onError: (error) => {
			setServerError(error.message);
		},
	});

	const form = useForm<PhoneFormValues>({
		resolver: zodResolver(phoneSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		defaultValues: {
			phone: "",
		},
	});

	function onSubmit(values: PhoneFormValues) {
		setServerError(null);
		lookupByPhone.mutate({ phone: values.phone });
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex w-full flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="pl-5.5">Phone Number</FormLabel>
							<FormControl>
								<USPhoneInput
									required
									value={field.value}
									onValueChange={field.onChange}
									onBlur={field.onBlur}
									onComplete={() => {
										form.trigger("phone");
									}}
								/>
							</FormControl>
							<FormMessage />
							{serverError && !form.formState.errors.phone && (
								<p className="mt-2 rounded-md bg-destructive px-3 py-2 text-sm text-white">
									{serverError}
								</p>
							)}
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					variant="attOutline"
					size="attOutline"
					className="mx-auto mt-auto"
					disabled={lookupByPhone.isPending || !form.formState.isValid}
				>
					{lookupByPhone.isPending ? (
						<div className="flex items-center gap-2">
							Looking up <LoadingSpinner className="size-4" />
						</div>
					) : (
						"Continue"
					)}
				</Button>
			</form>
		</Form>
	);
}
