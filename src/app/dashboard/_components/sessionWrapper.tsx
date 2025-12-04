"use client";

import type { ReactNode } from "react";
import type { Session } from "@/server/auth";

export function SessionWrapper({
	children,
}: {
	children: ReactNode;
	session: Session | null;
}) {
	return <>{children}</>;
}
