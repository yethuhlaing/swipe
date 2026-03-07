import { cache } from "react"
import { and, asc, eq, gte, lt, sql } from "drizzle-orm"
import { db } from "@/db"
import { aiDrafts, buyers, orders, pipelineStages } from "@/db/schema"
import type {
    DateRangeInput,
    FunnelStageDatum,
    RevenueMetrics,
    RevenueTrendDatum,
    AiDraftMetrics,
    TopLevelMetrics,
} from "@/lib/dto/analytics"

export type {
    DateRangeInput,
    FunnelStageDatum,
    RevenueMetrics,
    RevenueTrendDatum,
    AiDraftMetrics,
    TopLevelMetrics,
}

function getPreviousRange({ startDate, endDate }: DateRangeInput): DateRangeInput {
    const duration = Math.max(1, endDate.getTime() - startDate.getTime())
    return {
        startDate: new Date(startDate.getTime() - duration),
        endDate: new Date(startDate.getTime()),
    }
}

function toNumber(value: unknown): number {
    if (typeof value === "number") return value
    if (typeof value === "string") {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

function round2(value: number): number {
    return Number(value.toFixed(2))
}

function percentChange(current: number, previous: number): number {
    if (previous === 0) {
        if (current === 0) return 0
        return 100
    }
    return round2(((current - previous) / previous) * 100)
}

async function getRevenueSnapshot(
    tenantId: string,
    { startDate, endDate }: DateRangeInput
): Promise<{
    gmv: number
    orderCount: number
    reorderCount: number
    reorderRate: number
    aov: number
}> {
    const [result] = await db
        .select({
            gmv: sql<string>`coalesce(sum(${orders.total}), 0)`,
            orderCount: sql<number>`count(*)`,
            reorderCount:
                sql<number>`sum(case when ${orders.isReorder} = true then 1 else 0 end)`,
        })
        .from(orders)
        .where(
            and(
                eq(orders.tenantId, tenantId),
                gte(orders.createdAt, startDate),
                lt(orders.createdAt, endDate)
            )
        )

    const gmv = toNumber(result?.gmv)
    const orderCount = Number(result?.orderCount ?? 0)
    const reorderCount = Number(result?.reorderCount ?? 0)
    const reorderRate = orderCount > 0 ? (reorderCount / orderCount) * 100 : 0
    const aov = orderCount > 0 ? gmv / orderCount : 0

    return {
        gmv,
        orderCount,
        reorderCount,
        reorderRate: round2(reorderRate),
        aov: round2(aov),
    }
}

async function getAiSnapshot(
    tenantId: string,
    { startDate, endDate }: DateRangeInput
): Promise<{
    totalDrafts: number
    approvedCount: number
    rejectedCount: number
    editedCount: number
    approvalRate: number
}> {
    const [result] = await db
        .select({
            totalDrafts: sql<number>`count(*)`,
            approvedCount:
                sql<number>`sum(case when ${aiDrafts.status} = 'approved' then 1 else 0 end)`,
            rejectedCount:
                sql<number>`sum(case when ${aiDrafts.status} = 'rejected' then 1 else 0 end)`,
            editedCount:
                sql<number>`sum(case when ${aiDrafts.status} = 'edited' then 1 else 0 end)`,
        })
        .from(aiDrafts)
        .where(
            and(
                eq(aiDrafts.tenantId, tenantId),
                gte(aiDrafts.createdAt, startDate),
                lt(aiDrafts.createdAt, endDate)
            )
        )

    const totalDrafts = Number(result?.totalDrafts ?? 0)
    const approvedCount = Number(result?.approvedCount ?? 0)
    const rejectedCount = Number(result?.rejectedCount ?? 0)
    const editedCount = Number(result?.editedCount ?? 0)
    const approvable = approvedCount + editedCount
    const approvalRate = totalDrafts > 0 ? (approvable / totalDrafts) * 100 : 0

    return {
        totalDrafts,
        approvedCount,
        rejectedCount,
        editedCount,
        approvalRate: round2(approvalRate),
    }
}

export const getPipelineFunnel = cache(async (tenantId: string): Promise<FunnelStageDatum[]> => {
    const results = await db
        .select({
            stageId: pipelineStages.id,
            stageName: pipelineStages.name,
            slug: pipelineStages.slug,
            color: pipelineStages.color,
            position: pipelineStages.position,
            count: sql<number>`coalesce(count(${buyers.id}), 0)`,
        })
        .from(pipelineStages)
        .leftJoin(
            buyers,
            and(
                eq(buyers.tenantId, tenantId),
                eq(buyers.currentStageId, pipelineStages.id),
                eq(buyers.isDisqualified, false)
            )
        )
        .where(
            and(
                eq(pipelineStages.tenantId, tenantId),
                eq(pipelineStages.isActive, true)
            )
        )
        .groupBy(
            pipelineStages.id,
            pipelineStages.name,
            pipelineStages.slug,
            pipelineStages.color,
            pipelineStages.position
        )
        .orderBy(asc(pipelineStages.position))

    let previousCount: number | null = null
    return results.map((row) => {
        const count = Number(row.count ?? 0)
        const conversionFromPrev =
            previousCount === null || previousCount === 0
                ? null
                : round2((count / previousCount) * 100)
        previousCount = count

        return {
            stageId: row.stageId,
            stageName: row.stageName,
            slug: row.slug,
            color: row.color ?? "#6366f1",
            position: row.position,
            count,
            conversionFromPrev,
        }
    })
})

export const getRevenueMetrics = cache(
    async (tenantId: string, range: DateRangeInput): Promise<RevenueMetrics> => {
        const previousRange = getPreviousRange(range)
        const [current, previous] = await Promise.all([
            getRevenueSnapshot(tenantId, range),
            getRevenueSnapshot(tenantId, previousRange),
        ])

        return {
            gmv: round2(current.gmv),
            orderCount: current.orderCount,
            aov: current.aov,
            reorderCount: current.reorderCount,
            reorderRate: current.reorderRate,
            gmvChangePct: percentChange(current.gmv, previous.gmv),
            orderCountChangePct: percentChange(
                current.orderCount,
                previous.orderCount
            ),
            aovChangePct: percentChange(current.aov, previous.aov),
            reorderRateChangePct: percentChange(
                current.reorderRate,
                previous.reorderRate
            ),
        }
    }
)

export const getRevenueTrend = cache(
    async (tenantId: string, days: number): Promise<RevenueTrendDatum[]> => {
        const safeDays = Math.max(1, days)
        const endDate = new Date()
        const startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - (safeDays - 1))
        startDate.setHours(0, 0, 0, 0)

        const dayExpr = sql<string>`date_trunc('day', ${orders.createdAt})`
        const rows = await db
            .select({
                day: dayExpr,
                revenue: sql<string>`coalesce(sum(${orders.total}), 0)`,
                orderCount: sql<number>`count(*)`,
            })
            .from(orders)
            .where(
                and(
                    eq(orders.tenantId, tenantId),
                    gte(orders.createdAt, startDate),
                    lt(orders.createdAt, endDate)
                )
            )
            .groupBy(dayExpr)
            .orderBy(asc(dayExpr))

        const byDate = new Map<string, { revenue: number; orderCount: number }>()
        for (const row of rows) {
            const key = new Date(row.day).toISOString().slice(0, 10)
            byDate.set(key, {
                revenue: toNumber(row.revenue),
                orderCount: Number(row.orderCount ?? 0),
            })
        }

        const points: RevenueTrendDatum[] = []
        for (let i = 0; i < safeDays; i += 1) {
            const pointDate = new Date(startDate)
            pointDate.setDate(startDate.getDate() + i)
            const key = pointDate.toISOString().slice(0, 10)
            const value = byDate.get(key)
            points.push({
                date: key,
                revenue: round2(value?.revenue ?? 0),
                orderCount: value?.orderCount ?? 0,
            })
        }

        return points
    }
)

export const getAiDraftMetrics = cache(
    async (tenantId: string, range: DateRangeInput): Promise<AiDraftMetrics> => {
        const previousRange = getPreviousRange(range)
        const [current, previous] = await Promise.all([
            getAiSnapshot(tenantId, range),
            getAiSnapshot(tenantId, previousRange),
        ])

        return {
            totalDrafts: current.totalDrafts,
            approvedCount: current.approvedCount,
            rejectedCount: current.rejectedCount,
            editedCount: current.editedCount,
            approvalRate: current.approvalRate,
            approvalRateChangePct: percentChange(
                current.approvalRate,
                previous.approvalRate
            ),
        }
    }
)

export const getTopLevelMetrics = cache(
    async (tenantId: string, range: DateRangeInput): Promise<TopLevelMetrics> => {
        const previousRange = getPreviousRange(range)

        const [revenueCurrent, revenuePrevious, aiCurrent, aiPrevious, buyerCurrent, buyerPrevious] =
            await Promise.all([
                getRevenueSnapshot(tenantId, range),
                getRevenueSnapshot(tenantId, previousRange),
                getAiSnapshot(tenantId, range),
                getAiSnapshot(tenantId, previousRange),
                db
                    .select({
                        count: sql<number>`count(*)`,
                    })
                    .from(buyers)
                    .where(
                        and(
                            eq(buyers.tenantId, tenantId),
                            eq(buyers.isDisqualified, false),
                            gte(buyers.lastActivityAt, range.startDate),
                            lt(buyers.lastActivityAt, range.endDate)
                        )
                    ),
                db
                    .select({
                        count: sql<number>`count(*)`,
                    })
                    .from(buyers)
                    .where(
                        and(
                            eq(buyers.tenantId, tenantId),
                            eq(buyers.isDisqualified, false),
                            gte(buyers.lastActivityAt, previousRange.startDate),
                            lt(buyers.lastActivityAt, previousRange.endDate)
                        )
                    ),
            ])

        const currentActiveBuyers = Number(buyerCurrent[0]?.count ?? 0)
        const previousActiveBuyers = Number(buyerPrevious[0]?.count ?? 0)

        return {
            gmv: {
                value: round2(revenueCurrent.gmv),
                changePct: percentChange(revenueCurrent.gmv, revenuePrevious.gmv),
            },
            orders: {
                value: revenueCurrent.orderCount,
                changePct: percentChange(
                    revenueCurrent.orderCount,
                    revenuePrevious.orderCount
                ),
            },
            activeBuyers: {
                value: currentActiveBuyers,
                changePct: percentChange(
                    currentActiveBuyers,
                    previousActiveBuyers
                ),
            },
            aiApprovalRate: {
                value: aiCurrent.approvalRate,
                changePct: percentChange(
                    aiCurrent.approvalRate,
                    aiPrevious.approvalRate
                ),
            },
        }
    }
)
