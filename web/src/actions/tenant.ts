"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
    createTenant,
    getTenantsByUserId,
    getTenantById,
    updateTenant,
    connectInstagram,
    connectShopify,
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

// ============================================================================
// Actions
// ============================================================================

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
    // 1. Authenticate
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { success: false, error: "Unauthorized" }
    }

    // 2. Verify access
    const tenant = await getTenantById(tenantId)
    if (!tenant || tenant.ownerId !== session.user.id) {
        return { success: false, error: "Not found" }
    }

    // 3. Validate
    const data: Record<string, unknown> = {}
    const name = formData.get("name")
    if (name) data.name = name

    const result = updateTenantSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    // 4. Execute
    try {
        await updateTenant(tenantId, result.data)

        // 5. Revalidate
        revalidatePath(`/dashboard/settings`)

        return { success: true }
    } catch (error) {
        console.error("Failed to update tenant:", error)
        return { success: false, error: "Failed to update settings" }
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
