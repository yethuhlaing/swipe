import type { Buyer } from "@/db/schema"
import type { BuyerListParams, BuyerWithStage } from "@/lib/dto"
import {
    getBuyerById,
    listBuyers,
    updateBuyer,
    closeBuyerStageHistory,
    insertBuyerStageHistory,
} from "@/lib/data/buyers"

/** Business logic: move buyer to a new stage (close previous history, open new, update buyer). */
export async function moveBuyerToStage(
    tenantId: string,
    buyerId: string,
    newStageId: string
): Promise<Buyer | null> {
    const buyer = await getBuyerById(tenantId, buyerId)
    if (!buyer) return null

    const previousStageId = buyer.currentStageId
    const now = new Date()

    if (previousStageId) {
        const stageEnteredAt = buyer.stageEnteredAt ?? buyer.createdAt
        const durationSeconds = Math.floor(
            (now.getTime() - new Date(stageEnteredAt).getTime()) / 1000
        )
        await closeBuyerStageHistory(buyerId, previousStageId, now, durationSeconds)
    }

    await insertBuyerStageHistory(tenantId, buyerId, newStageId, now)

    return updateBuyer(tenantId, buyerId, {
        currentStageId: newStageId,
        stageEnteredAt: now,
        updatedAt: now,
    })
}

/** Business logic: add tag (no duplicate). */
export async function addTagToBuyer(
    tenantId: string,
    buyerId: string,
    tag: string
): Promise<Buyer | null> {
    const buyer = await getBuyerById(tenantId, buyerId)
    if (!buyer) return null

    const currentTags = (buyer.tags ?? []) as string[]
    if (currentTags.includes(tag)) return buyer

    return updateBuyer(tenantId, buyerId, {
        tags: [...currentTags, tag],
    })
}

/** Business logic: remove tag. */
export async function removeTagFromBuyer(
    tenantId: string,
    buyerId: string,
    tag: string
): Promise<Buyer | null> {
    const buyer = await getBuyerById(tenantId, buyerId)
    if (!buyer) return null

    const currentTags = (buyer.tags ?? []) as string[]
    return updateBuyer(tenantId, buyerId, {
        tags: currentTags.filter((t) => t !== tag),
    })
}

/** Business logic: mark buyer disqualified. */
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

// Passthrough to data layer
export { listBuyers, getBuyerById, updateBuyer }
export type { BuyerListParams, BuyerWithStage }
