"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

export default function ChartLeadFilesPerDay() {
	const files = api.stats.leadFilesPerDay.useQuery(undefined, {
		refetchInterval: 30000,
		placeholderData: keepPreviousData,
	});

	if (files.isPending) {
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
		count: {
			label: "Videos",
			color: "hsl(var(--chart-2))",
		},
	} satisfies ChartConfig;

	const totals = files.data?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Videos Per Day</CardTitle>
				<CardDescription>{totals} total videos</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
					<LineChart
						accessibilityLayer
						data={files.data}
						margin={{ left: 12, right: 12 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) =>
								format(parseISO(value as string), "M/d")
							}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Line
							dataKey="count"
							type="linear"
							stroke="hsl(var(--chart-2))"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
