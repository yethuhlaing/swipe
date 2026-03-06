import { db } from "@/db"
import {
    buyers,
    buyerStageHistory,
    pipelineStages,
    conversations,
    orders,
    type Buyer,
    type NewBuyer,
    type BuyerStageHistory,
} from "@/db/schema"
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm"

/**
 * Buyer Data Access Layer
 *
 * All buyer-related database operations.
 */

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Queries
// ============================================================================

export async function getBuyerById(
    tenantId: string,
    buyerId: string
): Promise<BuyerWithStage | null> {
    const [result] = await db
        .select({
            buyer: buyers,
            stage: {
                id: pipelineStages.id,
                name: pipelineStages.name,
                slug: pipelineStages.slug,
                position: pipelineStages.position,
            },
        })
        .from(buyers)
        .leftJoin(pipelineStages, eq(pipelineStages.id, buyers.currentStageId))
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.id, buyerId)))
        .limit(1)

    if (!result) return null

    return {
        ...result.buyer,
        stage: result.stage ?? undefined,
    }
}

export async function getBuyerByInstagramId(
    tenantId: string,
    instagramId: string
): Promise<Buyer | null> {
    const [buyer] = await db
        .select()
        .from(buyers)
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.instagramId, instagramId)))
        .limit(1)

    return buyer ?? null
}

export async function listBuyers(
    params: BuyerListParams
): Promise<{ buyers: BuyerWithStage[]; total: number }> {
    const {
        tenantId,
        stageId,
        search,
        tags,
        limit = 50,
        offset = 0,
        orderBy = "lastActivity",
        orderDir = "desc",
    } = params

    // Build where conditions
    const conditions = [eq(buyers.tenantId, tenantId)]

    if (stageId) {
        conditions.push(eq(buyers.currentStageId, stageId))
    }

    if (search) {
        conditions.push(
            or(
                ilike(buyers.instagramUsername, `%${search}%`),
                ilike(buyers.instagramName, `%${search}%`),
                ilike(buyers.storeName, `%${search}%`),
                ilike(buyers.email, `%${search}%`)
            )!
        )
    }

    // Build order by
    const orderColumn = {
        lastActivity: buyers.lastActivityAt,
        createdAt: buyers.createdAt,
        storeName: buyers.storeName,
        buyerScore: buyers.buyerScore,
    }[orderBy]

    const orderFn = orderDir === "asc" ? asc : desc

    // Execute query
    const results = await db
        .select({
            buyer: buyers,
            stage: {
                id: pipelineStages.id,
                name: pipelineStages.name,
                slug: pipelineStages.slug,
                position: pipelineStages.position,
            },
        })
        .from(buyers)
        .leftJoin(pipelineStages, eq(pipelineStages.id, buyers.currentStageId))
        .where(and(...conditions))
        .orderBy(orderFn(orderColumn))
        .limit(limit)
        .offset(offset)

    // Get total count
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(buyers)
        .where(and(...conditions))

    return {
        buyers: results.map((r) => ({
            ...r.buyer,
            stage: r.stage ?? undefined,
        })),
        total: Number(count),
    }
}

export async function getBuyersByStage(
    tenantId: string,
    stageId: string
): Promise<BuyerWithStage[]> {
    const results = await db
        .select({
            buyer: buyers,
            stage: {
                id: pipelineStages.id,
                name: pipelineStages.name,
                slug: pipelineStages.slug,
                position: pipelineStages.position,
            },
        })
        .from(buyers)
        .leftJoin(pipelineStages, eq(pipelineStages.id, buyers.currentStageId))
        .where(
            and(eq(buyers.tenantId, tenantId), eq(buyers.currentStageId, stageId))
        )
        .orderBy(desc(buyers.lastActivityAt))

    return results.map((r) => ({
        ...r.buyer,
        stage: r.stage ?? undefined,
    }))
}

export async function getBuyerStageHistory(
    buyerId: string
): Promise<Array<BuyerStageHistory & { stageName: string }>> {
    const results = await db
        .select({
            history: buyerStageHistory,
            stageName: pipelineStages.name,
        })
        .from(buyerStageHistory)
        .innerJoin(pipelineStages, eq(pipelineStages.id, buyerStageHistory.stageId))
        .where(eq(buyerStageHistory.buyerId, buyerId))
        .orderBy(desc(buyerStageHistory.enteredAt))

    return results.map((r) => ({
        ...r.history,
        stageName: r.stageName,
    }))
}

// ============================================================================
// Mutations
// ============================================================================

export async function createBuyer(
    data: Omit<NewBuyer, "id" | "createdAt" | "updatedAt">
): Promise<Buyer> {
    const [buyer] = await db.insert(buyers).values(data).returning()
    return buyer
}

export async function updateBuyer(
    tenantId: string,
    buyerId: string,
    data: Partial<Omit<NewBuyer, "id" | "tenantId" | "createdAt">>
): Promise<Buyer | null> {
    const [updated] = await db
        .update(buyers)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.id, buyerId)))
        .returning()

    return updated ?? null
}

export async function moveBuyerToStage(
    tenantId: string,
    buyerId: string,
    newStageId: string
): Promise<Buyer | null> {
    // Get current stage
    const [buyer] = await db
        .select()
        .from(buyers)
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.id, buyerId)))
        .limit(1)

    if (!buyer) return null

    const previousStageId = buyer.currentStageId
    const now = new Date()

    // Close previous stage history entry
    if (previousStageId) {
        const stageEnteredAt = buyer.stageEnteredAt ?? buyer.createdAt
        const durationSeconds = Math.floor(
            (now.getTime() - stageEnteredAt.getTime()) / 1000
        )

        await db
            .update(buyerStageHistory)
            .set({
                exitedAt: now,
                durationSeconds,
            })
            .where(
                and(
                    eq(buyerStageHistory.buyerId, buyerId),
                    eq(buyerStageHistory.stageId, previousStageId),
                    sql`${buyerStageHistory.exitedAt} IS NULL`
                )
            )
    }

    // Create new stage history entry
    await db.insert(buyerStageHistory).values({
        tenantId,
        buyerId,
        stageId: newStageId,
        enteredAt: now,
    })

    // Update buyer
    const [updated] = await db
        .update(buyers)
        .set({
            currentStageId: newStageId,
            stageEnteredAt: now,
            updatedAt: now,
        })
        .where(eq(buyers.id, buyerId))
        .returning()

    return updated ?? null
}

export async function addTagToBuyer(
    tenantId: string,
    buyerId: string,
    tag: string
): Promise<Buyer | null> {
    const [buyer] = await db
        .select()
        .from(buyers)
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.id, buyerId)))
        .limit(1)

    if (!buyer) return null

    const currentTags = (buyer.tags ?? []) as string[]
    if (currentTags.includes(tag)) return buyer

    return updateBuyer(tenantId, buyerId, {
        tags: [...currentTags, tag],
    })
}

export async function removeTagFromBuyer(
    tenantId: string,
    buyerId: string,
    tag: string
): Promise<Buyer | null> {
    const [buyer] = await db
        .select()
        .from(buyers)
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.id, buyerId)))
        .limit(1)

    if (!buyer) return null

    const currentTags = (buyer.tags ?? []) as string[]
    return updateBuyer(tenantId, buyerId, {
        tags: currentTags.filter((t) => t !== tag),
    })
}

export async function disqualifyBuyer(
    tenantId: string,
    buyerId: string,
    reason?: string
): Promise<Buyer | null> {
    return updateBuyer(tenantId, buyerId, {
        isDisqualified: true,
        disqualifiedReason: reason,
    })
}
