"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import CsvDownloadButton from "react-json-to-csv";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectLead } from "@/server/db/schema";
import { api } from "@/trpc/react";

export const columns: ColumnDef<SelectLead>[] = [
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
		accessorKey: "location",
		header: "Location",
	},
	{
		accessorKey: "signupTime",
		header: "Signup Time",
		cell: ({ row }) => {
			const signupTime: Date | null = row.getValue("signupTime");

			if (!signupTime) {
				return "";
			}

			return format(signupTime, "MMM d, pp");
		},
	},
	{
		accessorKey: "agePassed",
		header: "Age",
	},
	{
		accessorKey: "optIn",
		header: "Opt In",
	},
	{
		accessorKey: "terms",
		header: "Terms",
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
