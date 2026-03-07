import { redirect } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { getCurrentTenant } from "@/lib/session"
import {
    getAiDraftMetrics,
    getPipelineFunnel,
    getRevenueMetrics,
    getRevenueTrend,
    getTopLevelMetrics,
} from "@/lib/data/analytics"
import { Skeleton } from "@/components/ui/skeleton"

const MetricCards = dynamic(() =>
    import("./components/metric-cards").then((m) => m.MetricCards)
)
const FunnelChart = dynamic(() =>
    import("./components/funnel-chart").then((m) => m.FunnelChart)
)
const RevenueChart = dynamic(() =>
    import("./components/revenue-chart").then((m) => m.RevenueChart)
)
const AiPerformance = dynamic(() =>
    import("./components/ai-performance").then((m) => m.AiPerformance)
)

type AnalyticsPageProps = {
    searchParams: Promise<{ days?: string }>
}

function parseDays(daysParam?: string): 7 | 30 | 90 {
    if (!daysParam) return 30
    if (daysParam === "7") return 7
    if (daysParam === "90") return 90
    return 30
}

function ChartFallback() {
    return <Skeleton className="h-[360px] w-full rounded-xl" />
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    const params = await searchParams
    const selectedDays = parseDays(params.days)
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - selectedDays)

    const [topLevelMetrics, funnel, revenueMetrics, revenueTrend, aiMetrics] =
        await Promise.all([
            getTopLevelMetrics(tenant.id, { startDate, endDate }),
            getPipelineFunnel(tenant.id),
            getRevenueMetrics(tenant.id, { startDate, endDate }),
            getRevenueTrend(tenant.id, 90),
            getAiDraftMetrics(tenant.id, { startDate, endDate }),
        ])

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6 md:gap-6">
            <div className="flex flex-col gap-2 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Track pipeline conversion, revenue performance, and AI draft quality.
                </p>
            </div>

            <Suspense fallback={<ChartFallback />}>
                <MetricCards
                    metrics={topLevelMetrics}
                    revenueMetrics={revenueMetrics}
                    selectedDays={selectedDays}
                />
            </Suspense>

            <Suspense fallback={<ChartFallback />}>
                <FunnelChart data={funnel} />
            </Suspense>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <Suspense fallback={<ChartFallback />}>
                        <RevenueChart data={revenueTrend} selectedDays={selectedDays} />
                    </Suspense>
                </div>
                <div className="xl:col-span-1">
                    <Suspense fallback={<ChartFallback />}>
                        <AiPerformance metrics={aiMetrics} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
