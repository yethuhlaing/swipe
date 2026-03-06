import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

/**
 * Tenants - Brand accounts
 * Each brand is a tenant with isolated data via tenant_id foreign keys
 */
export const tenants = pgTable("tenants", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),

    // Owner reference (user who created the tenant)
    ownerId: text("owner_id").notNull(),

    // Instagram connection
    instagramBusinessId: text("instagram_business_id"),
    instagramAccessToken: text("instagram_access_token"),
    instagramTokenExpiresAt: timestamp("instagram_token_expires_at"),
    instagramConnectedAt: timestamp("instagram_connected_at"),

    // Shopify connection
    shopifyShop: text("shopify_shop"),
    shopifyAccessToken: text("shopify_access_token"),
    shopifyConnectedAt: timestamp("shopify_connected_at"),

    // Settings
    settings: jsonb("settings").$type<TenantSettings>().default({}),

    // Subscription
    plan: text("plan").$type<"starter" | "growth" | "scale" | "agency">().default("starter"),
    planExpiresAt: timestamp("plan_expires_at"),

    // Metadata
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type TenantSettings = {
    defaultReorderDays?: number
    aiConfidenceThreshold?: number
    timezone?: string
    currency?: string
}

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert

/**
 * Tenant Members - Users with access to a tenant
 */
export const tenantMembers = pgTable("tenant_members", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").$type<"owner" | "admin" | "member">().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type TenantMember = typeof tenantMembers.$inferSelect
export type NewTenantMember = typeof tenantMembers.$inferInsert
