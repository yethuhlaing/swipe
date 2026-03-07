import type { Buyer } from "@/db/schema"

export type BuyerWithStage = Buyer & {
    stage?: {
        id: string
        name: string
        slug: string
        position: number
    }
}

export type BuyerListParams = {
    tenantId: string
    stageId?: string
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
    orderBy?: "lastActivity" | "createdAt" | "storeName" | "buyerScore"
    orderDir?: "asc" | "desc"
}
