"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, Play } from "lucide-react";
import { useState } from "react";
import CsvDownloadButton from "react-json-to-csv";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectLead } from "@/server/db/schema";
import { api } from "@/trpc/react";

type LeadWithParticipation = SelectLead & {
	hasParticipated: boolean;
};

function ViewVideoButton({ leadId }: { leadId: string }) {
	const [open, setOpen] = useState(false);
	const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

	const files = api.leadFiles.getByLeadId.useQuery(
		{ leadId },
		{ enabled: open },
	);

	const videoUrl = api.leadFiles.getVideoUrl.useQuery(
		selectedFileId ? { id: selectedFileId } : skipToken,
	);

	const handleOpen = () => {
		setOpen(true);
		setSelectedFileId(null);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button variant="outline" size="sm" onClick={handleOpen}>
				<Play className="mr-1 h-4 w-4" />
				View
			</Button>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Video Playback</DialogTitle>
				</DialogHeader>

				{files.isLoading && (
					<div className="flex h-32 items-center justify-center">
						<Skeleton className="h-full w-full" />
					</div>
				)}

				{files.data && files.data.length === 0 && (
					<div className="flex h-32 items-center justify-center text-muted-foreground">
						No videos found for this lead
					</div>
				)}

				{files.data && files.data.length > 0 && !selectedFileId && (
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Select a video to view:</p>
						<div className="grid gap-2">
							{files.data.map((file) => (
								<Button
									key={file.id}
									variant="outline"
									className="justify-start"
									onClick={() => setSelectedFileId(file.id)}
								>
									Play {file.play} - {format(file.createdAt, "MMM d, pp")}
								</Button>
							))}
						</div>
					</div>
				)}

				{selectedFileId && videoUrl.isLoading && (
					<div className="flex h-64 items-center justify-center">
						<Skeleton className="h-full w-full" />
					</div>
				)}

				{selectedFileId && videoUrl.error && (
					<div className="flex h-64 items-center justify-center text-destructive">
						Failed to load video: {videoUrl.error.message}
					</div>
				)}

				{selectedFileId && videoUrl.data?.url && (
					<div className="space-y-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedFileId(null)}
						>
							← Back to list
						</Button>
						<video
							className="w-full rounded-lg"
							src={videoUrl.data.url}
							controls
							preload="auto"
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function ForceSendSmsButton({ leadId, phone }: { leadId: string; phone: string }) {
	const utils = api.useUtils();
	const sendSms = api.lead.forceSendSms.useMutation({
		onSuccess: () => {
			toast.success("SMS sent successfully");
			utils.lead.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(`Failed to send SMS: ${error.message}`);
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline" size="sm" disabled={sendSms.isPending}>
					<MessageSquare className="mr-1 h-4 w-4" />
					{sendSms.isPending ? "Sending..." : "Send SMS"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Send SMS?</AlertDialogTitle>
					<AlertDialogDescription>
						This will send a text message to <strong>{phone}</strong> with a link
						to their video. This is a billable action.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => sendSms.mutate({ leadId })}>
						Send SMS
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function ActionsCell({ lead }: { lead: LeadWithParticipation }) {
	if (!lead.hasParticipated) {
		return <span className="text-muted-foreground text-sm">No videos</span>;
	}

	return (
		<div className="flex gap-2">
			<ViewVideoButton leadId={lead.id} />
			<ForceSendSmsButton leadId={lead.id} phone={lead.phone} />
		</div>
	);
}

const columns: ColumnDef<LeadWithParticipation>[] = [
	{
		accessorKey: "firstName",
		header: "First Name",
	},
	{
		accessorKey: "lastName",
		header: "Last Name",
	},
	{
		accessorKey: "phone",
		header: "Phone",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "team",
		header: "Team",
	},
	{
		accessorKey: "createdAt",
		header: "Signup Time",
		cell: ({ row }) => {
			const signupTime: Date | null = row.getValue("createdAt");

			if (!signupTime) {
				return "";
			}

			return format(signupTime, "MMM d, pp");
		},
	},
	{
		accessorKey: "terms",
		header: "Terms",
		cell: ({ row }) => {
			const terms: boolean = row.getValue("terms");

			return terms ? "Y" : "N";
		},
	},
	{
		accessorKey: "survey",
		header: "Survey",
		cell: ({ row }) => {
			const survey: boolean = row.getValue("survey");

			return survey ? "Y" : "N";
		},
	},
	{
		accessorKey: "promotions",
		header: "Promotions",
		cell: ({ row }) => {
			const promotions: boolean = row.getValue("promotions");

			return promotions ? "Y" : "N";
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <ActionsCell lead={row.original} />,
	},
];

export default function LeadsTable() {
	const leads = api.lead.getAll.useQuery();

	if (leads.isPending) {
		return (
			<div className="w-full">
				<Skeleton className="h-48 w-full rounded" />
			</div>
		);
	}

	return (
		<div className="w-full space-y-4 rounded-lg border bg-card p-5 text-card-foreground shadow-xs">
			{leads.data ? (
				<>
					<div className="text-right">
						<Button asChild variant="default" className="w-[150px]">
							<CsvDownloadButton data={leads.data} filename="leads.csv" />
						</Button>
					</div>
					<DataTable columns={columns} data={leads.data} />
				</>
			) : null}
		</div>
	);
}
