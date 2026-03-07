import { db } from "@/db"
import {
    tenants,
    tenantMembers,
    pipelineStages,
    priceTiers,
    templates,
    DEFAULT_PIPELINE_STAGES,
    DEFAULT_PRICE_TIERS,
    DEFAULT_TEMPLATES,
    type Tenant,
    type NewTenant,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * Tenant Data Access Layer
 *
 * All tenant-related database operations.
 * Use these functions instead of direct db queries for consistency.
 */

// ============================================================================
// Queries
// ============================================================================

export async function getTenantById(id: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1)
    return tenant ?? null
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
    return tenant ?? null
}

export async function getTenantByOwnerId(ownerId: string): Promise<Tenant | null> {
    const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.ownerId, ownerId))
        .limit(1)
    return tenant ?? null
}

export async function getTenantsByUserId(userId: string): Promise<Tenant[]> {
    const memberships = await db
        .select({ tenant: tenants })
        .from(tenantMembers)
        .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
        .where(eq(tenantMembers.userId, userId))

    return memberships.map((m) => m.tenant)
}

// ============================================================================
// Mutations
// ============================================================================

/** Single insert; returns the created tenant. */
export async function insertTenant(data: {
    name: string
    ownerId: string
    slug: string
}): Promise<Tenant> {
    const [tenant] = await db
        .insert(tenants)
        .values({
            name: data.name,
            ownerId: data.ownerId,
            slug: data.slug,
        })
        .returning()
    return tenant
}

/** Add a member to a tenant. */
export async function addTenantMember(
    tenantId: string,
    userId: string,
    role: "owner" | "admin" | "member"
): Promise<void> {
    await db.insert(tenantMembers).values({
        tenantId,
        userId,
        role,
    })
}

/** Initialize default pipeline stages, price tiers, and templates for a new tenant. */
export async function initializeDefaultsForTenant(tenantId: string): Promise<void> {
    await initializeDefaultPipelineStages(tenantId)
    await initializeDefaultPriceTiers(tenantId)
    await initializeDefaultTemplates(tenantId)
}

export async function updateTenant(
    id: string,
    data: Partial<Omit<NewTenant, "id" | "createdAt">>
): Promise<Tenant | null> {
    const [updated] = await db
        .update(tenants)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tenants.id, id))
        .returning()

    return updated ?? null
}

export async function connectInstagram(
    tenantId: string,
    data: {
        instagramBusinessId: string
        instagramAccessToken: string
        expiresAt?: Date
    }
): Promise<Tenant | null> {
    return updateTenant(tenantId, {
        instagramBusinessId: data.instagramBusinessId,
        instagramAccessToken: data.instagramAccessToken,
        instagramTokenExpiresAt: data.expiresAt,
        instagramConnectedAt: new Date(),
    })
}

export async function connectShopify(
    tenantId: string,
    data: {
        shopifyShop: string
        shopifyAccessToken: string
    }
): Promise<Tenant | null> {
    return updateTenant(tenantId, {
        shopifyShop: data.shopifyShop,
        shopifyAccessToken: data.shopifyAccessToken,
        shopifyConnectedAt: new Date(),
    })
}

export async function disconnectInstagram(tenantId: string): Promise<Tenant | null> {
    return updateTenant(tenantId, {
        instagramBusinessId: null,
        instagramAccessToken: null,
        instagramTokenExpiresAt: null,
        instagramConnectedAt: null,
    })
}

export async function disconnectShopify(tenantId: string): Promise<Tenant | null> {
    return updateTenant(tenantId, {
        shopifyShop: null,
        shopifyAccessToken: null,
        shopifyConnectedAt: null,
    })
}

// ============================================================================
// Helpers (used by initializeDefaultsForTenant)
// ============================================================================

async function initializeDefaultPipelineStages(tenantId: string) {
    const stagesToInsert = DEFAULT_PIPELINE_STAGES.map((stage) => ({
        tenantId,
        ...stage,
        isDefault: true,
    }))

    await db.insert(pipelineStages).values(stagesToInsert)
}

async function initializeDefaultPriceTiers(tenantId: string) {
    const tiersToInsert = DEFAULT_PRICE_TIERS.map((tier) => ({
        tenantId,
        ...tier,
    }))

    await db.insert(priceTiers).values(tiersToInsert)
}

async function initializeDefaultTemplates(tenantId: string) {
    const templatesToInsert = DEFAULT_TEMPLATES.map((template) => ({
        tenantId,
        ...template,
        variables: [...template.variables],
        isDefault: true,
    }))

    await db.insert(templates).values(templatesToInsert)
}
