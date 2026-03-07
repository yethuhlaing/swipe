"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { RevenueTrendDatum } from "@/dto/analytics"

type RevenueChartProps = {
    data: RevenueTrendDatum[]
    selectedDays: 7 | 30 | 90
}

type Range = 7 | 30 | 90

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--primary)",
    },
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value)
}

export function RevenueChart({ data, selectedDays }: RevenueChartProps) {
    const [range, setRange] = useState<Range>(selectedDays)

    const chartData = useMemo(() => {
        const sliced = data.slice(-range)
        return sliced.map((entry) => ({
            ...entry,
            label: format(new Date(entry.date), "MMM d"),
        }))
    }, [data, range])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>
                        Daily GMV and order activity
                    </CardDescription>
                </div>
                <Select
                    value={String(range)}
                    onValueChange={(v) => setRange(Number(v) as Range)}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="pt-4">
                <ChartContainer
                    config={chartConfig}
                    className="h-[360px] w-full"
                >
                    <AreaChart
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 8 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted/30"
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            minTickGap={28}
                            className="text-xs"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={72}
                            tickFormatter={(value) => formatCurrency(value)}
                            className="text-xs"
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) =>
                                        formatCurrency(Number(value))
                                    }
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-revenue)"
                            fill="url(#colorRevenue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
