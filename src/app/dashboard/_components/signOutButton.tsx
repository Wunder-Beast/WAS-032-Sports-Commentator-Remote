"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
	return (
		<Button
			onMouseDown={() => {
				signOut({ callbackUrl: "/", redirect: true }).catch((e) => {
					console.error(e);
				});
			}}
		>
			Sign Out
		</Button>
	);
}
