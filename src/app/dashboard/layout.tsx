// app/admin/layout.tsx
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/server/auth";
import { AdminSidebar } from "./_components/adminSidebar";
import { DynamicBreadcrumb } from "./_components/dynamicBreadcrumb";
import { SessionWrapper } from "./_components/sessionWrapper";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Get the sidebar state from cookies for persistence
	// const cookieStore = await cookies();
	// const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
	const session = await getServerSession();

	return (
		<SessionWrapper session={session}>
			<SidebarProvider defaultOpen={false}>
				{/* The sidebar component */}
				<AdminSidebar />

				{/* CRUCIAL: SidebarInset wraps your main content */}
				<SidebarInset>
					{/* Header with trigger button */}
					<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<DynamicBreadcrumb />
					</header>

					{/* Main content area */}
					<main className="min-h-screen flex-1 bg-neutral-100 text-black">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</SessionWrapper>
	);
}
