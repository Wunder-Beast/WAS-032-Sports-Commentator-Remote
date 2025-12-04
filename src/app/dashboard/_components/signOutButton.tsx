"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
	const router = useRouter();

	return (
		<Button
			onMouseDown={async () => {
				await signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/sign-in");
						},
					},
				});
			}}
		>
			Sign Out
		</Button>
	);
}
