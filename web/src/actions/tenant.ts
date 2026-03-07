"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createTenant } from "@/lib/services"
import {
    getTenantsByUserId,
    getTenantById,
    updateTenant,
    connectInstagram,
    connectShopify,
    disconnectInstagram,
    disconnectShopify,
} from "@/lib/data/tenants"

/**
 * Tenant Server Actions
 *
 * All tenant-related mutations follow this pattern:
 * 1. Authenticate
 * 2. Validate input
 * 3. Execute operation
 * 4. Revalidate cache
 * 5. Return result or redirect
 */

// ============================================================================
// Schemas
// ============================================================================

const createTenantSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
})

const updateTenantSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    settings: z
        .object({
            defaultReorderDays: z.number().min(1).max(365).optional(),
            aiConfidenceThreshold: z.number().min(0).max(100).optional(),
            timezone: z.string().optional(),
            currency: z.string().optional(),
        })
        .optional(),
})

const connectInstagramSchema = z.object({
    instagramBusinessId: z.string().min(1, "Instagram business ID is required"),
    instagramAccessToken: z.string().min(1, "Instagram access token is required"),
    instagramTokenExpiresAt: z.preprocess(
        (value) => (value === "" || value == null ? undefined : value),
        z.coerce.date().optional()
    ),
})

const connectShopifySchema = z.object({
    shopifyShop: z.string().min(1, "Shopify shop is required"),
    shopifyAccessToken: z.string().min(1, "Shopify access token is required"),
})

// ============================================================================
// Actions
// ============================================================================

async function verifyTenantOwner(tenantId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { success: false as const, error: "Unauthorized" }
    }

    const tenant = await getTenantById(tenantId)
    if (!tenant || tenant.ownerId !== session.user.id) {
        return { success: false as const, error: "Not found" }
    }

    return { success: true as const, tenant, user: session.user }
}

function revalidateSettingsAndDashboardPaths() {
    revalidatePath("/settings/account")
    revalidatePath("/settings/integrations")
    revalidatePath("/settings/pipeline")
    revalidatePath("/dashboard/pipeline")
}

/**
 * Create a new tenant (brand account)
 */
export async function createTenantAction(formData: FormData) {
    // 1. Authenticate
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { success: false, error: "Unauthorized" }
    }

    // 2. Validate
    const result = createTenantSchema.safeParse({
        name: formData.get("name"),
    })

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    // 3. Execute
    try {
        const tenant = await createTenant({
            name: result.data.name,
            ownerId: session.user.id,
        })

        // 4. Revalidate
        revalidatePath("/dashboard")

        return { success: true, tenantId: tenant.id }
    } catch (error) {
        console.error("Failed to create tenant:", error)
        return { success: false, error: "Failed to create account" }
    }
}

/**
 * Update tenant settings
 */
export async function updateTenantAction(
    tenantId: string,
    formData: FormData
) {
    const access = await verifyTenantOwner(tenantId)
    if (!access.success) {
        return { success: false, error: access.error }
    }

    // Build payload from submitted settings values only.
    const data: Record<string, unknown> = {}

    const name = formData.get("name")
    if (name) data.name = name

    const settings: Record<string, unknown> = {}

    const defaultReorderDays = formData.get("defaultReorderDays")
    if (defaultReorderDays && String(defaultReorderDays).trim() !== "") {
        settings.defaultReorderDays = Number(defaultReorderDays)
    }

    const aiConfidenceThreshold = formData.get("aiConfidenceThreshold")
    if (aiConfidenceThreshold && String(aiConfidenceThreshold).trim() !== "") {
        settings.aiConfidenceThreshold = Number(aiConfidenceThreshold)
    }

    const timezone = formData.get("timezone")
    if (timezone && String(timezone).trim() !== "") {
        settings.timezone = String(timezone)
    }

    const currency = formData.get("currency")
    if (currency && String(currency).trim() !== "") {
        settings.currency = String(currency)
    }

    if (Object.keys(settings).length > 0) {
        data.settings = {
            ...access.tenant.settings,
            ...settings,
        }
    }

    const result = updateTenantSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        await updateTenant(tenantId, result.data)
        revalidateSettingsAndDashboardPaths()

        return { success: true }
    } catch (error) {
        console.error("Failed to update tenant:", error)
        return { success: false, error: "Failed to update settings" }
    }
}

export async function connectInstagramAction(tenantId: string, formData: FormData) {
    const access = await verifyTenantOwner(tenantId)
    if (!access.success) {
        return { success: false, error: access.error }
    }

    const result = connectInstagramSchema.safeParse({
        instagramBusinessId: formData.get("instagramBusinessId"),
        instagramAccessToken: formData.get("instagramAccessToken"),
        instagramTokenExpiresAt: formData.get("instagramTokenExpiresAt"),
    })
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        await connectInstagram(tenantId, {
            instagramBusinessId: result.data.instagramBusinessId,
            instagramAccessToken: result.data.instagramAccessToken,
            expiresAt: result.data.instagramTokenExpiresAt,
        })
        revalidateSettingsAndDashboardPaths()
        return { success: true }
    } catch (error) {
        console.error("Failed to connect Instagram:", error)
        return { success: false, error: "Failed to connect Instagram" }
    }
}

export async function disconnectInstagramAction(tenantId: string) {
    const access = await verifyTenantOwner(tenantId)
    if (!access.success) {
        return { success: false, error: access.error }
    }

    try {
        await disconnectInstagram(tenantId)
        revalidateSettingsAndDashboardPaths()
        return { success: true }
    } catch (error) {
        console.error("Failed to disconnect Instagram:", error)
        return { success: false, error: "Failed to disconnect Instagram" }
    }
}

export async function connectShopifyAction(tenantId: string, formData: FormData) {
    const access = await verifyTenantOwner(tenantId)
    if (!access.success) {
        return { success: false, error: access.error }
    }

    const result = connectShopifySchema.safeParse({
        shopifyShop: formData.get("shopifyShop"),
        shopifyAccessToken: formData.get("shopifyAccessToken"),
    })
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        await connectShopify(tenantId, result.data)
        revalidateSettingsAndDashboardPaths()
        return { success: true }
    } catch (error) {
        console.error("Failed to connect Shopify:", error)
        return { success: false, error: "Failed to connect Shopify" }
    }
}

export async function disconnectShopifyAction(tenantId: string) {
    const access = await verifyTenantOwner(tenantId)
    if (!access.success) {
        return { success: false, error: access.error }
    }

    try {
        await disconnectShopify(tenantId)
        revalidateSettingsAndDashboardPaths()
        return { success: true }
    } catch (error) {
        console.error("Failed to disconnect Shopify:", error)
        return { success: false, error: "Failed to disconnect Shopify" }
    }
}

/**
 * Get current user's tenants
 */
export async function getUserTenantsAction() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { success: false, error: "Unauthorized", tenants: [] }
    }

    try {
        const tenants = await getTenantsByUserId(session.user.id)
        return { success: true, tenants }
    } catch (error) {
        console.error("Failed to get tenants:", error)
        return { success: false, error: "Failed to load accounts", tenants: [] }
    }
}
