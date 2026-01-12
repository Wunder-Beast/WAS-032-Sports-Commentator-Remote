"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
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
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function ChartPlayCountsPerDay() {
	const plays = api.stats.playCountsPerDay.useQuery(undefined, {
		refetchInterval: 30000,
		placeholderData: keepPreviousData,
	});

	if (plays.isPending) {
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
		bbq: {
			label: "BBQ",
			color: "hsl(var(--chart-1))",
		},
		jumpPass: {
			label: "Jump Pass",
			color: "hsl(var(--chart-2))",
		},
		theHero: {
			label: "The Hero",
			color: "hsl(var(--chart-3))",
		},
	} satisfies ChartConfig;

	const totals =
		plays.data?.reduce(
			(acc, curr) => acc + curr.bbq + curr.jumpPass + curr.theHero,
			0,
		) ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Play Counts Per Day</CardTitle>
				<CardDescription>{totals} total videos by play type</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
					<BarChart accessibilityLayer data={plays.data}>
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
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="bbq"
							stackId="a"
							fill="hsl(var(--chart-1))"
							radius={[0, 0, 0, 0]}
						/>
						<Bar
							dataKey="jumpPass"
							stackId="a"
							fill="hsl(var(--chart-2))"
							radius={[0, 0, 0, 0]}
						/>
						<Bar
							dataKey="theHero"
							stackId="a"
							fill="hsl(var(--chart-3))"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
