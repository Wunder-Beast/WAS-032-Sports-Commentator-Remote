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

export default function FileByPlay() {
	const files = api.lead.getByPlay.useQuery();

	if (files.isPending) {
		return (
			<div className="w-full">
				<Skeleton className="h-[125px] w-full rounded" />
			</div>
		);
	}

	const chartConfig = {
		PLAY1: {
			label: "Play 1",
			color: "hsl(var(--chart-1))",
		},
		PLAY2: {
			label: "Play 2",
			color: "hsl(var(--chart-2))",
		},
		PLAY3: {
			label: "Play 3",
			color: "hsl(var(--chart-3))",
		},
		PLAY4: {
			label: "Play 4",
			color: "hsl(var(--chart-4))",
		},
	} satisfies ChartConfig;

	const totals = files.data?.reduce(
		(acc, curr) => acc + (curr.play1 + curr.play2 + curr.play3 + curr.play4),
		0,
	);

	console.log("totals", totals);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Files By Play</CardTitle>
				<CardDescription>{totals} total files</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="w-full">
					<ChartContainer
						config={chartConfig}
						className="min-h-[400px] w-full rounded"
					>
						<BarChart accessibilityLayer data={files.data}>
							<CartesianGrid vertical={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<Bar dataKey="PLAY1" fill="var(--chart-1)" radius={4} />
							<Bar dataKey="PLAY2" fill="var(--chart-2)" radius={4} />
							<Bar dataKey="PLAY3" fill="var(--chart-3)" radius={4} />
							<Bar dataKey="PLAY4" fill="var(--chart-4)" radius={4} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	);
}
