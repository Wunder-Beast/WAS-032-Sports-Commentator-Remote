import { redirect } from "next/navigation";
import { SignIn } from "@/components/sign-in";
import { getServerSession } from "@/server/auth";

export default async function SignInPage() {
	const session = await getServerSession();

	// If already logged in, redirect to dashboard
	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
			<SignIn />
		</div>
	);
}
