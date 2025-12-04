"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import CsvDownloadButton from "react-json-to-csv";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectLead } from "@/server/db/schema";
import { api } from "@/trpc/react";

type LeadWithParticipation = SelectLead & {
	hasParticipated: boolean;
};

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
