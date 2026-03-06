"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
    listBuyers,
    getBuyerById,
    updateBuyer,
    moveBuyerToStage,
    addTagToBuyer,
    removeTagFromBuyer,
    disqualifyBuyer,
    type BuyerListParams,
} from "@/lib/data/buyers"
import { getTenantById } from "@/lib/data/tenants"

/**
 * Buyer Server Actions
 *
 * CRM operations for managing buyer/retailer relationships.
 */

// ============================================================================
// Schemas
// ============================================================================

const updateBuyerSchema = z.object({
    storeName: z.string().max(200).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().max(50).optional(),
    website: z.string().url().optional().or(z.literal("")),
    location: z.string().max(200).optional(),
    storeType: z
        .enum(["boutique", "department", "online", "marketplace", "other"])
        .optional(),
    priceTier: z.enum(["tier1", "tier2", "tier3"]).optional(),
    notes: z.string().max(5000).optional(),
    reorderDays: z.number().min(1).max(365).optional(),
})

// ============================================================================
// Helpers
// ============================================================================

async function verifyTenantAccess(tenantId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { authorized: false, error: "Unauthorized" }
    }

    const tenant = await getTenantById(tenantId)
    if (!tenant || tenant.ownerId !== session.user.id) {
        return { authorized: false, error: "Not found" }
    }

    return { authorized: true, userId: session.user.id }
}

// ============================================================================
// Actions
// ============================================================================

/**
 * List buyers with filtering and pagination
 */
export async function listBuyersAction(params: Omit<BuyerListParams, "tenantId"> & { tenantId: string }) {
    const access = await verifyTenantAccess(params.tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, buyers: [], total: 0 }
    }

    try {
        const result = await listBuyers(params)
        return { success: true, ...result }
    } catch (error) {
        console.error("Failed to list buyers:", error)
        return { success: false, error: "Failed to load buyers", buyers: [], total: 0 }
    }
}

/**
 * Get a single buyer with full details
 */
export async function getBuyerAction(tenantId: string, buyerId: string) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, buyer: null }
    }

    try {
        const buyer = await getBuyerById(tenantId, buyerId)
        if (!buyer) {
            return { success: false, error: "Buyer not found", buyer: null }
        }
        return { success: true, buyer }
    } catch (error) {
        console.error("Failed to get buyer:", error)
        return { success: false, error: "Failed to load buyer", buyer: null }
    }
}

/**
 * Update buyer information
 */
export async function updateBuyerAction(
    tenantId: string,
    buyerId: string,
    formData: FormData
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    // Build data object from FormData
    const data: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
        if (value !== "" && value !== null) {
            data[key] = value
        }
    }

    // Handle numeric fields
    if (data.reorderDays) {
        data.reorderDays = Number(data.reorderDays)
    }

    const result = updateBuyerSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        const updated = await updateBuyer(tenantId, buyerId, result.data)
        if (!updated) {
            return { success: false, error: "Buyer not found" }
        }

        revalidatePath(`/dashboard/crm/${buyerId}`)
        revalidatePath("/dashboard/crm")

        return { success: true }
    } catch (error) {
        console.error("Failed to update buyer:", error)
        return { success: false, error: "Failed to update buyer" }
    }
}

/**
 * Move buyer to a different pipeline stage
 */
export async function moveBuyerToStageAction(
    tenantId: string,
    buyerId: string,
    stageId: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        const updated = await moveBuyerToStage(tenantId, buyerId, stageId)
        if (!updated) {
            return { success: false, error: "Buyer not found" }
        }

        revalidatePath("/dashboard/pipeline")
        revalidatePath(`/dashboard/crm/${buyerId}`)

        return { success: true }
    } catch (error) {
        console.error("Failed to move buyer:", error)
        return { success: false, error: "Failed to move buyer" }
    }
}

/**
 * Add a tag to a buyer
 */
export async function addTagAction(
    tenantId: string,
    buyerId: string,
    tag: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    if (!tag || tag.length > 50) {
        return { success: false, error: "Invalid tag" }
    }

    try {
        await addTagToBuyer(tenantId, buyerId, tag.toLowerCase().trim())

        revalidatePath(`/dashboard/crm/${buyerId}`)

        return { success: true }
    } catch (error) {
        console.error("Failed to add tag:", error)
        return { success: false, error: "Failed to add tag" }
    }
}

/**
 * Remove a tag from a buyer
 */
export async function removeTagAction(
    tenantId: string,
    buyerId: string,
    tag: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        await removeTagFromBuyer(tenantId, buyerId, tag)

        revalidatePath(`/dashboard/crm/${buyerId}`)

        return { success: true }
    } catch (error) {
        console.error("Failed to remove tag:", error)
        return { success: false, error: "Failed to remove tag" }
    }
}

/**
 * Disqualify a buyer (mark as not a fit)
 */
export async function disqualifyBuyerAction(
    tenantId: string,
    buyerId: string,
    reason?: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        await disqualifyBuyer(tenantId, buyerId, reason)

        revalidatePath("/dashboard/pipeline")
        revalidatePath("/dashboard/crm")

        return { success: true }
    } catch (error) {
        console.error("Failed to disqualify buyer:", error)
        return { success: false, error: "Failed to disqualify buyer" }
    }
}
