"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function ChartLeadsByFileCount() {
	const data = api.stats.leadsGroupedByFileCount.useQuery(undefined, {
		refetchInterval: 30000,
		placeholderData: keepPreviousData,
	});

	if (data.isPending) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-24" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[300px] w-full rounded" />
				</CardContent>
			</Card>
		);
	}

	const chartConfig = {
		leadCount: {
			label: "Leads",
			color: "hsl(var(--chart-3))",
		},
	} satisfies ChartConfig;

	const chartData = data.data?.map((item) => ({
		...item,
		label:
			item.fileCount === 0
				? "0 videos"
				: item.fileCount === 1
					? "1 video"
					: `${item.fileCount} videos`,
	}));

	const totals = data.data?.reduce((acc, curr) => acc + curr.leadCount, 0) ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Leads by Video Count</CardTitle>
				<CardDescription>
					{totals} leads grouped by number of videos submitted
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Bar
							dataKey="leadCount"
							fill="hsl(var(--chart-3))"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
