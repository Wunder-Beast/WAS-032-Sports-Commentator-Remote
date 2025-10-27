"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertLeadSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";

export function LeadForm() {
	const utils = api.useUtils();

	const createLead = api.lead.create.useMutation({
		onMutate: () => {
			toast.loading("Signing Up", {
				id: "sign-up",
				description: "",
			});
		},
		onSuccess: async () => {
			await utils.lead.invalidate();
			toast.success("Sign Up Successful", {
				id: "sign-up",
				description: "Thank you for signing up!",
				closeButton: true,
			});
			form.reset();
		},
		onError: (error) => {
			toast.error("Error Signing Up", {
				id: "sign-up",
				description: error.message,
				closeButton: true,
			});
		},
	});

	const form = useForm<z.infer<typeof insertLeadSchema>>({
		resolver: zodResolver(insertLeadSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			agePassed: false,
			optIn: false,
			terms: false,
			location: "location 1",
		},
	});

	function onSubmit(values: z.infer<typeof insertLeadSchema>) {
		// force underage phone numbers to not be collected
		if (!values.agePassed) {
			form.setValue("phone", undefined);
		}

		createLead.mutate(values);
	}

	const isSubmittable = form.formState.isValid;

	return (
		<div className="w-full">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid w-full grid-cols-1 gap-4"
				>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="agePassed"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Are you at least 18 years old?</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={(e) => {
												field.onChange(e === "true");
											}}
											defaultValue={field.value ? "true" : "false"}
											className="grid grid-cols-2 gap-4"
										>
											<FormItem className="flex items-center justify-end space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="true" />
												</FormControl>
												<FormLabel className="font-normal">Yes</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="false" />
												</FormControl>
												<FormLabel className="font-normal">No</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<Input required {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input required {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input required {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.watch("agePassed") ? (
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<PhoneInput
												required
												type="tel"
												defaultCountry="US"
												countries={["US", "MX"]}
												{...field}
												value={field.value ?? undefined}
												placeholder="(555) 333-4444"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : null}
						<FormField
							control={form.control}
							name="terms"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value ?? false}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											Do you accept the terms and conditions?
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="optIn"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value ?? false}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											Would you like to receive marketing emails?
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							disabled={createLead.isPending || !isSubmittable}
						>
							Submit
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
