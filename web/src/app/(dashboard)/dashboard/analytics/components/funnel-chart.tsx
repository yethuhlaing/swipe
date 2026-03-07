"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { FunnelStageDatum } from "@/lib/data/analytics"

type FunnelChartProps = {
    data: FunnelStageDatum[]
}

const chartConfig = {
    buyers: {
        label: "Buyers",
        color: "var(--primary)",
    },
}

export function FunnelChart({ data }: FunnelChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pipeline Funnel</CardTitle>
                <CardDescription>Buyer count by pipeline stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[420px] w-full">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" horizontal={false} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis
                            dataKey="stageName"
                            type="category"
                            width={128}
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                        />
                        <ChartTooltip
                            cursor={{ fill: "var(--muted)" }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="count" radius={8}>
                            <LabelList
                                dataKey="count"
                                position="right"
                                className="fill-foreground text-xs"
                            />
                            {data.map((entry) => (
                                <Cell key={entry.stageId} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2 xl:grid-cols-3">
                    {data.map((stage) => (
                        <div key={stage.stageId} className="rounded-md border px-3 py-2">
                            <div className="font-medium text-foreground">{stage.stageName}</div>
                            <div>{stage.count.toLocaleString()} buyers</div>
                            <div>
                                Conversion from previous:{" "}
                                {stage.conversionFromPrev === null
                                    ? "N/A"
                                    : `${stage.conversionFromPrev.toFixed(1)}%`}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
