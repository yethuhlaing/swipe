"use client"

import { Pie, PieChart } from "recharts"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AiDraftMetrics } from "@/lib/dto"

type AiPerformanceProps = {
    metrics: AiDraftMetrics
}

const chartConfig = {
    approved: { label: "Approved", color: "var(--chart-2)" },
    edited: { label: "Edited", color: "var(--chart-1)" },
    rejected: { label: "Rejected", color: "var(--chart-5)" },
}

function formatSignedPercent(value: number): string {
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
}

export function AiPerformance({ metrics }: AiPerformanceProps) {
    const chartData = [
        { key: "approved", value: metrics.approvedCount, fill: "var(--color-approved)" },
        { key: "edited", value: metrics.editedCount, fill: "var(--color-edited)" },
        { key: "rejected", value: metrics.rejectedCount, fill: "var(--color-rejected)" },
    ]
    const trendUp = metrics.approvalRateChangePct >= 0
    const TrendIcon = trendUp ? TrendingUp : TrendingDown

    return (
        <Card className="h-full">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle>AI Performance</CardTitle>
                    <Badge variant="outline">
                        <TrendIcon className="size-4" />
                        {formatSignedPercent(metrics.approvalRateChangePct)}
                    </Badge>
                </div>
                <CardDescription>Draft outcomes and approval quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="key"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={76}
                            strokeWidth={2}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    nameKey="key"
                                    formatter={(value, name) => [
                                        `${Number(value).toLocaleString()}`,
                                        String(name),
                                    ]}
                                />
                            }
                        />
                    </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Approval Rate</div>
                        <div className="text-xl font-semibold">
                            {metrics.approvalRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Total Drafts</div>
                        <div className="text-xl font-semibold">
                            {metrics.totalDrafts.toLocaleString()}
                        </div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Approved</div>
                        <div className="font-semibold">{metrics.approvedCount}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Rejected</div>
                        <div className="font-semibold">{metrics.rejectedCount}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
