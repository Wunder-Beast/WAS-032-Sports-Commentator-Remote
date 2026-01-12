"use client";

import { keepPreviousData, skipToken } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, MessageSquare, Play, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectLeadFile } from "@/server/db/schema";
import { api } from "@/trpc/react";

type ModerationStatus = "pending" | "approved" | "rejected";

type FileWithLead = SelectLeadFile & {
	lead: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		phone: string;
		email: string | null;
	};
};

function VideoPreviewButton({ fileId }: { fileId: string }) {
	const [open, setOpen] = useState(false);

	const videoUrl = api.leadFiles.getVideoUrl.useQuery(
		open ? { id: fileId } : skipToken,
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button variant="outline" size="sm" onClick={() => setOpen(true)}>
				<Play className="mr-1 h-4 w-4" />
				Preview
			</Button>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Video Preview</DialogTitle>
				</DialogHeader>

				{videoUrl.isLoading && (
					<div className="flex h-64 items-center justify-center">
						<Skeleton className="h-full w-full" />
					</div>
				)}

				{videoUrl.error && (
					<div className="flex h-64 items-center justify-center text-destructive">
						Failed to load video: {videoUrl.error.message}
					</div>
				)}

				{videoUrl.data?.url && (
					<video
						className="w-full rounded-lg"
						src={videoUrl.data.url}
						controls
						autoPlay
						preload="auto"
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function ApproveButton({ fileId }: { fileId: string }) {
	const utils = api.useUtils();
	const moderate = api.leadFiles.moderate.useMutation({
		onSuccess: () => {
			toast.success("Video approved");
			utils.leadFiles.getModerationQueue.invalidate();
		},
		onError: (error) => {
			toast.error(`Failed to approve: ${error.message}`);
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="text-green-600 hover:bg-green-50 hover:text-green-700"
					disabled={moderate.isPending}
				>
					<Check className="mr-1 h-4 w-4" />
					{moderate.isPending ? "..." : "Approve"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Approve this video?</AlertDialogTitle>
					<AlertDialogDescription>
						This will allow the video to be publicly viewable and enable sending
						the share link via SMS.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => moderate.mutate({ id: fileId, status: "approved" })}
					>
						Approve
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function RejectButton({ fileId }: { fileId: string }) {
	const [notes, setNotes] = useState("");
	const utils = api.useUtils();
	const moderate = api.leadFiles.moderate.useMutation({
		onSuccess: () => {
			toast.success("Video rejected");
			utils.leadFiles.getModerationQueue.invalidate();
			setNotes("");
		},
		onError: (error) => {
			toast.error(`Failed to reject: ${error.message}`);
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="text-red-600 hover:bg-red-50 hover:text-red-700"
					disabled={moderate.isPending}
				>
					<X className="mr-1 h-4 w-4" />
					{moderate.isPending ? "..." : "Reject"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reject this video?</AlertDialogTitle>
					<AlertDialogDescription>
						The participant will not be able to view this video. They will
						receive an apologetic SMS instead of a share link.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="py-4">
					<Label htmlFor="notes">Notes (optional)</Label>
					<Input
						id="notes"
						placeholder="Reason for rejection..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						className="mt-2"
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setNotes("")}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-600 hover:bg-red-700"
						onClick={() =>
							moderate.mutate({
								id: fileId,
								status: "rejected",
								notes: notes || undefined,
							})
						}
					>
						Reject
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function SendSmsButton({
	fileId,
	leadId,
	phone,
	status,
	smsSent,
}: {
	fileId: string;
	leadId: string;
	phone: string;
	status: ModerationStatus;
	smsSent: boolean;
}) {
	const utils = api.useUtils();
	const sendSms = api.lead.forceSendSms.useMutation({
		onSuccess: (data) => {
			const message =
				data.status === "approved" ? "Share link SMS sent" : "Apology SMS sent";
			toast.success(message);
			utils.leadFiles.getModerationQueue.invalidate();
		},
		onError: (error) => {
			toast.error(`Failed to send SMS: ${error.message}`);
		},
	});

	const buttonText =
		status === "approved" ? "Send Video Link" : "Send Apology SMS";
	const description =
		status === "approved"
			? `This will send a text message to ${phone} with a link to their video.`
			: `This will send an apologetic message to ${phone} explaining their video couldn't be processed.`;

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={sendSms.isPending}
					className={smsSent ? "opacity-50" : ""}
				>
					<MessageSquare className="mr-1 h-4 w-4" />
					{sendSms.isPending ? "Sending..." : smsSent ? "Resend" : buttonText}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{smsSent ? "Resend SMS?" : "Send SMS?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{description} This is a billable action.
						{smsSent && " An SMS has already been sent for this video."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => sendSms.mutate({ leadId, fileId })}>
						Send SMS
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function StatusBadge({ status }: { status: ModerationStatus }) {
	switch (status) {
		case "pending":
			return (
				<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
					Pending
				</Badge>
			);
		case "approved":
			return (
				<Badge variant="secondary" className="bg-green-100 text-green-800">
					Approved
				</Badge>
			);
		case "rejected":
			return (
				<Badge variant="secondary" className="bg-red-100 text-red-800">
					Rejected
				</Badge>
			);
	}
}

function ActionsCell({ file }: { file: FileWithLead }) {
	return (
		<div className="flex flex-wrap gap-2">
			<VideoPreviewButton fileId={file.id} />
			{file.moderationStatus === "pending" && (
				<>
					<ApproveButton fileId={file.id} />
					<RejectButton fileId={file.id} />
				</>
			)}
			{file.moderationStatus !== "pending" && (
				<SendSmsButton
					fileId={file.id}
					leadId={file.leadId}
					phone={file.lead.phone}
					status={file.moderationStatus}
					smsSent={!!file.smsSentAt}
				/>
			)}
		</div>
	);
}

const columns: ColumnDef<FileWithLead>[] = [
	{
		accessorKey: "lead.firstName",
		header: "First Name",
		cell: ({ row }) => row.original.lead.firstName || "-",
	},
	{
		accessorKey: "lead.lastName",
		header: "Last Name",
		cell: ({ row }) => row.original.lead.lastName || "-",
	},
	{
		accessorKey: "lead.phone",
		header: "Phone",
		cell: ({ row }) => row.original.lead.phone,
	},
	{
		accessorKey: "play",
		header: "Play #",
	},
	{
		accessorKey: "createdAt",
		header: "Submitted",
		cell: ({ row }) => {
			const date: Date | null = row.getValue("createdAt");
			if (!date) return "";
			return format(date, "MMM d, pp");
		},
	},
	{
		accessorKey: "moderationStatus",
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge status={row.getValue("moderationStatus")} />
		),
	},
	{
		accessorKey: "smsSentAt",
		header: "SMS Sent",
		cell: ({ row }) => {
			const date: Date | null = row.getValue("smsSentAt");
			if (!date) return <span className="text-muted-foreground">-</span>;
			return format(date, "MMM d, pp");
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <ActionsCell file={row.original} />,
	},
];

export function ModerationQueue() {
	const [statusFilter, setStatusFilter] = useState<
		ModerationStatus | undefined
	>("pending");

	const queue = api.leadFiles.getModerationQueue.useQuery(
		{ status: statusFilter },
		{
			refetchInterval: 30000,
			placeholderData: keepPreviousData,
		},
	);

	const pendingCount = api.leadFiles.getModerationQueue.useQuery(
		{ status: "pending" },
		{
			refetchInterval: 30000,
			placeholderData: keepPreviousData,
		},
	);

	if (queue.isPending) {
		return (
			<div className="w-full">
				<Skeleton className="h-48 w-full rounded" />
			</div>
		);
	}

	return (
		<div className="w-full space-y-4 rounded-lg border bg-card p-5 text-card-foreground shadow-xs">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Moderation Queue</h2>
				{pendingCount.data && pendingCount.data.length > 0 && (
					<Badge variant="destructive">
						{pendingCount.data.length} pending
					</Badge>
				)}
			</div>

			<div className="flex gap-2">
				<Button
					variant={statusFilter === "pending" ? "default" : "outline"}
					size="sm"
					onClick={() => setStatusFilter("pending")}
				>
					Pending
				</Button>
				<Button
					variant={statusFilter === "approved" ? "default" : "outline"}
					size="sm"
					onClick={() => setStatusFilter("approved")}
				>
					Approved
				</Button>
				<Button
					variant={statusFilter === "rejected" ? "default" : "outline"}
					size="sm"
					onClick={() => setStatusFilter("rejected")}
				>
					Rejected
				</Button>
				<Button
					variant={statusFilter === undefined ? "default" : "outline"}
					size="sm"
					onClick={() => setStatusFilter(undefined)}
				>
					All
				</Button>
			</div>

			{queue.data ? (
				queue.data.length === 0 ? (
					<div className="flex h-32 items-center justify-center text-muted-foreground">
						No videos {statusFilter ? `with status "${statusFilter}"` : ""}
					</div>
				) : (
					<DataTable columns={columns} data={queue.data as FileWithLead[]} />
				)
			) : null}
		</div>
	);
}
