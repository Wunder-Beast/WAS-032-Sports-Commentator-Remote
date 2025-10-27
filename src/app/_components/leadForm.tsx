"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { insertLeadSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import PrivacyModal from "./privacyModal";

interface LeadFormProps {
	agePassed: boolean;
	play: number;
}

export function LeadForm({ agePassed, play }: LeadFormProps) {
	const utils = api.useUtils();
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
			agePassed,
			optIn: false,
			terms: false,
			play,
		},
	});

	useEffect(() => {
		form.setValue("agePassed", agePassed);
		form.setValue("play", play);
	}, [agePassed, play, form]);

	function onSubmit(values: z.infer<typeof insertLeadSchema>) {
		// force underage phone numbers to not be collected
		if (!values.agePassed) {
			form.setValue("phone", undefined);
		}

		createLead.mutate(values);
	}

	const isSubmittable = form.formState.isValid;

	const showModal = () => {
		console.log("Opening privacy modal");
		setShowPrivacyModal(true);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="relative w-full">
			<PrivacyModal
				active={showPrivacyModal}
				closeButton={() => {
					setShowPrivacyModal(false);
				}}
			/>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid w-full grid-cols-1 gap-4"
				>
					<div className="space-y-5">
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
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<PhoneInput
											required
											type="tel"
											defaultCountry="US"
											countries={["US"]}
											{...field}
											value={field.value ?? undefined}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.watch("agePassed") ? (
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
						) : null}
						{form.watch("agePassed") ? (
							<FormField
								control={form.control}
								name="terms"
								render={({ field }) => (
									<FormItem className="flex flex-col px-3 text-left">
										<p className="-tracking-[0.3px] text-xs">
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
										<div className="flex items-center">
											<FormControl>
												<Checkbox
													checked={field.value ?? false}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="pl-2 leading-none">
												<FormLabel className="font-light text-xs italic">
													Required!
												</FormLabel>
											</div>
										</div>
									</FormItem>
								)}
							/>
						) : null}
						<FormField
							control={form.control}
							name="optIn"
							render={({ field }) => (
								<FormItem className="flex flex-col px-3 text-left">
									<p className="-tracking-[0.3px] text-xs">
										By marking the box below and providing my email or number on
										this form, I agree to receive a post-event marketing survey.
										By providing my number on this form, I also agree to receive
										no more than two text messages using automated dialing
										equipment. Standard messaging rates apply.
									</p>
									<div className="flex items-center">
										<FormControl>
											<Checkbox
												checked={field.value ?? false}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="pl-2 leading-none">
											<FormLabel className="font-light text-xs italic">
												Optional
											</FormLabel>
										</div>
									</div>
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							variant="attCobalt"
							size="fixed"
							disabled={createLead.isPending || !isSubmittable}
						>
							Continue
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
