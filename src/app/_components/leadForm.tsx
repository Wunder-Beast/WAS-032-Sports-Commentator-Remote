"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { USPhoneInput } from "@/components/ui/us-phone-input";
import { insertLeadSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import PrivacyModal from "./privacyModal";

interface LeadFormProps {
	agePassed: boolean;
	play: number;
	onSuccess?: () => void;
}

export function LeadForm({ agePassed, play, onSuccess }: LeadFormProps) {
	const utils = api.useUtils();
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);

	const createLead = api.lead.create.useMutation({
		onSuccess: async () => {
			await utils.lead.invalidate();
			form.reset();
			onSuccess?.();
		},
		onError: (error) => {
			const errorMessage =
				error.message || "An unexpected error occurred. Please try again.";
			toast.error("Error Signing Up", {
				id: "sign-up",
				description: errorMessage,
				duration: 10000,
				dismissible: true,
				closeButton: true,
			});
		},
	});

	const form = useForm<z.infer<typeof insertLeadSchema>>({
		resolver: zodResolver(insertLeadSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			agePassed,
			play,
			terms: false,
			survey: false,
			promotions: false,
		},
	});

	useEffect(() => {
		form.setValue("agePassed", agePassed);
		form.setValue("play", play);

		if (!agePassed) {
			form.setValue("email", undefined);
			form.setValue("survey", false);
			form.setValue("promotions", false);
		}
	}, [agePassed, play, form]);

	function onSubmit(values: z.infer<typeof insertLeadSchema>) {
		createLead.mutate(values);
	}

	const isSubmittable = form.formState.isValid;

	const showModal = () => {
		console.log("Opening privacy modal");
		setShowPrivacyModal(true);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="relative flex h-full w-full flex-grow">
			<PrivacyModal
				active={showPrivacyModal}
				closeButton={() => {
					setShowPrivacyModal(false);
				}}
			/>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex w-full flex-grow flex-col gap-4"
				>
					<div className="flex flex-grow flex-col space-y-5">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input required placeholder="First Name" {...field} />
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
									<FormControl>
										<Input required placeholder="Last Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<USPhoneInput
											required
											placeholder="Your Phone"
											value={field.value}
											onValueChange={field.onChange}
											onBlur={field.onBlur}
											onComplete={() => {
												// Trigger validation when 10 digits are entered
												form.trigger("phone");
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{agePassed ? (
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input required placeholder="Your Email" {...field} />
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
								<FormItem>
									<div className="mt-5 flex flex-col items-start gap-1 px-2 text-left">
										<p className="text-pretty text-[12px]">
											By marking the box below, I agree and consent that AT&T,
											and its affiliated companies, as well as third parties
											acting on AT&T's behalf, may process personal data from or
											about me as outlined in the{" "}
											<button
												type="button"
												className="cursor-pointer font-bold no-underline"
												onMouseDown={(e) => {
													e.preventDefault();
													showModal();
												}}
											>
												AT&T Privacy Notice
											</button>{" "}
											necessary to register me and facilitate my participation
											at the event.
										</p>
										<div className="relative flex items-center gap-3">
											<FormControl>
												<Checkbox
													className="mt-0.5 size-5"
													checked={field.value ?? false}
													onCheckedChange={(checked) => {
														field.onChange(checked);
														// Trigger validation immediately when checkbox changes
														form.trigger();
													}}
												/>
											</FormControl>
											<div className="pt-0.5 text-[14px] italic">Required</div>
										</div>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						{agePassed ? (
							<FormField
								control={form.control}
								name="survey"
								render={({ field }) => (
									<FormItem>
										<div className="flex flex-col items-start gap-1 px-2 text-left">
											<p className="text-pretty text-[12px]">
												By marking the box below and providing my email or
												number on this form, I agree to receive a post-event
												marketing survey. By providing my number on this form, I
												also agree to receive no more than two text messages
												using automated dialing equipment. Standard messaging
												rates apply.
											</p>
											<div className="relative flex items-center gap-3">
												<FormControl>
													<Checkbox
														className="mt-0.5 size-5"
														checked={field.value ?? false}
														onCheckedChange={(checked) => {
															field.onChange(checked);
															// Trigger validation immediately when checkbox changes
															form.trigger();
														}}
													/>
												</FormControl>
												<div className="pt-0.5 text-[14px] italic">
													Optional
												</div>
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : null}
						{agePassed ? (
							<FormField
								control={form.control}
								name="promotions"
								render={({ field }) => (
									<FormItem>
										<div className="flex flex-col items-start gap-1 px-2 text-left">
											<p className="text-pretty text-[12px]">
												By submitting your email address, you agree to receive
												future emails from AT&T and its family of companies. We
												will email offers and promotions about AT&T and AT&T 5G
												and other AT&T products.
											</p>
											<div className="relative flex items-center gap-3">
												<FormControl>
													<Checkbox
														className="mt-0.5 size-5"
														checked={field.value ?? false}
														onCheckedChange={(checked) => {
															field.onChange(checked);
															// Trigger validation immediately when checkbox changes
															form.trigger();
														}}
													/>
												</FormControl>
												<div className="pt-0.5 text-[14px] italic">
													Optional
												</div>
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : null}
						<div className="mt-auto text-center">
							<Button
								type="submit"
								variant="attOutline"
								size="attOutline"
								className="mt-5"
								disabled={createLead.isPending || !isSubmittable}
							>
								{createLead.isPending ? (
									<div className="flex items-center gap-2">
										Submitting <LoadingSpinner className="size-4" />
									</div>
								) : (
									"Continue"
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
