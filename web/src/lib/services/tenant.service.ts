import type { Tenant } from "@/db/schema"
import {
    insertTenant,
    addTenantMember,
    initializeDefaultsForTenant,
} from "@/lib/data/tenants"

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50)
}

/** Business logic: create tenant with slug, owner membership, and default stages/tiers/templates. */
export async function createTenant(data: {
    name: string
    ownerId: string
    slug?: string
}): Promise<Tenant> {
    const slug = data.slug ?? generateSlug(data.name)
    const tenant = await insertTenant({
        name: data.name,
        ownerId: data.ownerId,
        slug,
    })
    await addTenantMember(tenant.id, data.ownerId, "owner")
    await initializeDefaultsForTenant(tenant.id)
    return tenant
}
