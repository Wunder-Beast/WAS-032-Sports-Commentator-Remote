import "@/styles/globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "WAS-032-Sports-Commentator-Remote",
	description: "",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<TRPCReactProvider>
					{children}
					<Toaster />
				</TRPCReactProvider>
			</body>
		</html>
	);
}
