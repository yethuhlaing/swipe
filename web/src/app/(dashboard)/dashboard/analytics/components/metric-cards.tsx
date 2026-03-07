"use client"

import { BarChart3, DollarSign, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { RevenueMetrics, TopLevelMetrics } from "@/lib/dto"

type MetricCardsProps = {
    metrics: TopLevelMetrics
    revenueMetrics: RevenueMetrics
    selectedDays: 7 | 30 | 90
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value)
}

function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`
}

function formatSignedPercent(value: number): string {
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
}

export function MetricCards({ metrics, revenueMetrics, selectedDays }: MetricCardsProps) {
    const data = [
        {
            title: "Total GMV",
            value: formatCurrency(metrics.gmv.value),
            change: metrics.gmv.changePct,
            icon: DollarSign,
            footer: `AOV ${formatCurrency(revenueMetrics.aov)} across ${metrics.orders.value} orders`,
        },
        {
            title: "Orders",
            value: metrics.orders.value.toLocaleString(),
            change: metrics.orders.changePct,
            icon: ShoppingCart,
            footer: `${formatPercent(revenueMetrics.reorderRate)} reorder rate this period`,
        },
        {
            title: "Active Buyers",
            value: metrics.activeBuyers.value.toLocaleString(),
            change: metrics.activeBuyers.changePct,
            icon: Users,
            footer: "Buyers with activity in the selected period",
        },
        {
            title: "AI Approval Rate",
            value: formatPercent(metrics.aiApprovalRate.value),
            change: metrics.aiApprovalRate.changePct,
            icon: BarChart3,
            footer: "Approved + edited drafts divided by total",
        },
    ]

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
            {data.map((metric) => {
                const TrendIcon = metric.change >= 0 ? TrendingUp : TrendingDown

                return (
                    <Card key={metric.title} className="@container/card">
                        <CardHeader>
                            <CardDescription>{metric.title}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {metric.value}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <TrendIcon className="h-4 w-4" />
                                    {formatSignedPercent(metric.change)}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                <metric.icon className="size-4" />
                                Last {selectedDays} days
                            </div>
                            <div className="text-muted-foreground">{metric.footer}</div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
