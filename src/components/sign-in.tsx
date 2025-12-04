"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SvgBeast } from "@/components/svg/beast";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { signIn } from "@/lib/auth-client";

const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignIn() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

	const [loading, setLoading] = useState(false);

	const form = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	const handlePasswordSignIn = async (data: SignInFormData) => {
		setLoading(true);
		try {
			await signIn.email(
				{
					email: data.email,
					password: data.password,
					callbackURL: callbackUrl,
					rememberMe: data.rememberMe,
				},
				{
					onSuccess: () => {
						toast.success("Signed in successfully");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message || "Invalid email or password");
					},
				},
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setLoading(true);
		try {
			await signIn.social(
				{
					provider: "google",
					callbackURL: callbackUrl,
				},
				{
					onError: (ctx) => {
						toast.error(ctx.error.message || "Failed to sign in with Google");
						setLoading(false);
					},
				},
			);
		} catch {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your email and password to sign in
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handlePasswordSignIn)}
						className="grid gap-4"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											disabled={loading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Enter your password"
											autoComplete="current-password"
											disabled={loading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="rememberMe"
							render={({ field }) => (
								<FormItem className="flex items-center gap-2 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={loading}
										/>
									</FormControl>
									<FormLabel className="font-normal">Remember me</FormLabel>
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</Form>

				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">Or</span>
					</div>
				</div>

				<Button
					variant="outline"
					className="w-full gap-2"
					disabled={loading}
					onClick={handleGoogleSignIn}
				>
					<SvgBeast className="size-6" />
					Wunderbeast Sign In
				</Button>
			</CardContent>
		</Card>
	);
}
