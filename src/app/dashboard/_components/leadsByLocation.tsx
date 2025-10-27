"use client";

import { Bar, BarChart, CartesianGrid } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function LeadsByLocation() {
	const leads = api.lead.getByLocation.useQuery();

	if (leads.isPending) {
		return (
			<div className="w-full">
				<Skeleton className="h-[125px] w-full rounded" />
			</div>
		);
	}

	const chartConfig = {
		LOC1: {
			label: "Location 1",
			color: "hsl(var(--chart-1))",
		},
		LOC2: {
			label: "Location 2",
			color: "hsl(var(--chart-2))",
		},
		LOC3: {
			label: "Location 3",
			color: "hsl(var(--chart-3))",
		},
	} satisfies ChartConfig;

	const totals = leads.data?.reduce(
		(acc, curr) => acc + (curr.loc1 + curr.loc2 + curr.loc3),
		0,
	);

	console.log("totals", totals);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Leads By Location</CardTitle>
				<CardDescription>{totals} total leads</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="w-full">
					<ChartContainer
						config={chartConfig}
						className="min-h-[400px] w-full rounded"
					>
						<BarChart accessibilityLayer data={leads.data}>
							<CartesianGrid vertical={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<Bar dataKey="LOC1" fill="var(--chart-1)" radius={4} />
							<Bar dataKey="LOC2" fill="var(--chart-2)" radius={4} />
							<Bar dataKey="LOC3" fill="var(--chart-3)" radius={4} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	);
}
