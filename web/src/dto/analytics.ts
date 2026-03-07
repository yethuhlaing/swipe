export type DateRangeInput = {
    startDate: Date
    endDate: Date
}

export type FunnelStageDatum = {
    stageId: string
    stageName: string
    slug: string
    color: string
    position: number
    count: number
    conversionFromPrev: number | null
}

export type RevenueMetrics = {
    gmv: number
    orderCount: number
    aov: number
    reorderCount: number
    reorderRate: number
    gmvChangePct: number
    orderCountChangePct: number
    aovChangePct: number
    reorderRateChangePct: number
}

export type RevenueTrendDatum = {
    date: string
    revenue: number
    orderCount: number
}

export type AiDraftMetrics = {
    totalDrafts: number
    approvedCount: number
    rejectedCount: number
    editedCount: number
    approvalRate: number
    approvalRateChangePct: number
}

export type TopLevelMetrics = {
    gmv: { value: number; changePct: number }
    orders: { value: number; changePct: number }
    activeBuyers: { value: number; changePct: number }
    aiApprovalRate: { value: number; changePct: number }
}
