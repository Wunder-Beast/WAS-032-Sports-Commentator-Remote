// components/admin-sidebar.tsx
"use client";

import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	DatabaseIcon,
	HomeIcon,
	LogOutIcon,
	ServerIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { isSuperAdmin } from "@/lib/utils";
import { api } from "@/trpc/react";

// Main navigation items
const mainNavItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: HomeIcon,
	},
	{
		title: "Moderation",
		url: "/dashboard/moderation",
		icon: ShieldCheckIcon,
	},
	{
		title: "Users",
		url: "/dashboard/users",
		icon: UsersIcon,
	},
];

export function AdminSidebar() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [currentStage, setCurrentStage] = useState("development");
	const [downloadState, setDownloadState] = useState<
		"idle" | "loading" | "success"
	>("idle");
	const showStageSwitcher = isSuperAdmin(session?.user?.role);
	const userName = session?.user?.name || session?.user?.email || "User";
	const firstLetter = userName.charAt(0).toUpperCase();

	const downloadDatabaseMutation = api.utility.downloadDatabase.useMutation();

	const handleDatabaseDownload = async () => {
		setDownloadState("loading");
		try {
			const result = await downloadDatabaseMutation.mutateAsync();

			// Convert base64 to blob
			const byteCharacters = atob(result.data);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: "application/octet-stream" });

			// Download the file
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = result.filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);

			// Show success state for 3 seconds
			setDownloadState("success");
			setTimeout(() => {
				setDownloadState("idle");
			}, 3000);
		} catch (error) {
			console.error("Failed to download database:", error);
			alert("Failed to download database");
			setDownloadState("idle");
		}
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const hostname = window.location.hostname;
			if (
				hostname === "localhost" ||
				hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
			) {
				setCurrentStage("development");
			} else if (hostname.includes("staging")) {
				setCurrentStage("staging");
			} else {
				setCurrentStage("production");
			}
		}
	}, []);

	const handleStageSwitch = (
		stage: "production" | "staging" | "development",
	) => {
		// Don't redirect if we're already on the selected stage
		if (stage === currentStage) {
			return;
		}

		if (stage === "production") {
			window.location.href = "https://yourproject.com/dashboard";
		} else if (stage === "staging") {
			window.location.href = "https://staging.yourproject.com/dashboard";
		} else if (stage === "development") {
			window.location.href = "http://localhost:3000/dashboard";
		}
	};

	return (
		<Sidebar collapsible="icon">
			{/* Sidebar Header */}
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						{showStageSwitcher ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
											<ServerIcon className="size-4" />
										</div>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">Admin</span>
											<span className="truncate text-xs capitalize">
												{currentStage}
											</span>
										</div>
										<ChevronDownIcon className="ml-auto" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
									align="start"
									side="bottom"
									sideOffset={4}
								>
									<DropdownMenuItem
										onClick={() => handleStageSwitch("development")}
										className={
											currentStage === "development" ? "bg-accent" : ""
										}
									>
										<span>Development</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleStageSwitch("staging")}
										className={currentStage === "staging" ? "bg-accent" : ""}
									>
										<span>Staging</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleStageSwitch("production")}
										className={currentStage === "production" ? "bg-accent" : ""}
									>
										<span>Production</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<SidebarMenuButton size="lg" asChild>
								<Link href="/dashboard">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<ServerIcon className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">Admin Panel</span>
									</div>
								</Link>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Sidebar Content */}
			<SidebarContent>
				{/* Main Navigation Group */}
				<SidebarGroup>
					<SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems
								.filter((item) => {
									// Show Users and Moderation links to admins and super admins
									if (item.title === "Users" || item.title === "Moderation") {
										return (
											session?.user?.role === "admin" ||
											isSuperAdmin(session?.user?.role)
										);
									}
									return true;
								})
								.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={pathname === item.url}>
											<Link href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* Sidebar Footer with user menu */}
			<SidebarFooter>
				<SidebarMenu>
					{showStageSwitcher && (
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={handleDatabaseDownload}
								className="cursor-pointer"
								disabled={downloadState === "loading"}
							>
								{downloadState === "loading" && (
									<LoadingSpinner className="size-4" />
								)}
								{downloadState === "success" && (
									<CheckIcon className="size-4" />
								)}
								{downloadState === "idle" && (
									<DatabaseIcon className="size-4" />
								)}
								<span>Download Database</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
										{firstLetter}
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
										<span className="truncate font-semibold">
											{session?.user?.name || "User"}
										</span>
										<span className="truncate text-xs">
											{session?.user?.email || ""}
										</span>
									</div>
									<ChevronUpIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuItem
									onClick={() => signOut()}
									className="cursor-pointer"
								>
									<LogOutIcon className="mr-2 size-4" />
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			{/* Sidebar Rail for collapse functionality */}
			<SidebarRail />
		</Sidebar>
	);
}
