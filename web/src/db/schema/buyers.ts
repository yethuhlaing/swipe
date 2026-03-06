import { pgTable, text, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core"

/**
 * Buyers - Retailer CRM records
 * Auto-populated from DM activity, enriched by AI
 */
export const buyers = pgTable("buyers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Instagram info (auto-populated)
    instagramId: text("instagram_id"),
    instagramUsername: text("instagram_username"),
    instagramName: text("instagram_name"),
    instagramProfilePic: text("instagram_profile_pic"),
    instagramFollowerCount: integer("instagram_follower_count"),
    instagramBio: text("instagram_bio"),

    // Manual/enriched fields
    storeName: text("store_name"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    location: text("location"),
    city: text("city"),
    country: text("country"),

    // Classification
    storeType: text("store_type").$type<"boutique" | "department" | "online" | "marketplace" | "other">(),
    priceTier: text("price_tier").$type<"tier1" | "tier2" | "tier3">().default("tier1"),

    // AI-generated score (Growth tier)
    buyerScore: integer("buyer_score"),
    buyerScoreReasoning: text("buyer_score_reasoning"),
    buyerScoreUpdatedAt: timestamp("buyer_score_updated_at"),

    // Pipeline
    currentStageId: text("current_stage_id"),
    stageEnteredAt: timestamp("stage_entered_at"),

    // Reorder
    reorderDays: integer("reorder_days"),
    nextReorderAt: timestamp("next_reorder_at"),
    reorderPaused: boolean("reorder_paused").default(false),

    // Tags (array of tag strings)
    tags: jsonb("tags").$type<string[]>().default([]),

    // Notes
    notes: text("notes"),

    // Metadata
    firstContactAt: timestamp("first_contact_at"),
    lastActivityAt: timestamp("last_activity_at"),
    isDisqualified: boolean("is_disqualified").default(false),
    disqualifiedReason: text("disqualified_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("buyers_tenant_id_idx").on(table.tenantId),
    index("buyers_instagram_id_idx").on(table.instagramId),
    index("buyers_current_stage_idx").on(table.currentStageId),
    index("buyers_last_activity_idx").on(table.lastActivityAt),
])

export type Buyer = typeof buyers.$inferSelect
export type NewBuyer = typeof buyers.$inferInsert

/**
 * Buyer Stage History - Track stage transitions
 */
export const buyerStageHistory = pgTable("buyer_stage_history", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    buyerId: text("buyer_id").notNull(),
    stageId: text("stage_id").notNull(),
    enteredAt: timestamp("entered_at").notNull().defaultNow(),
    exitedAt: timestamp("exited_at"),
    durationSeconds: integer("duration_seconds"),
}, (table) => [
    index("buyer_stage_history_buyer_idx").on(table.buyerId),
])

export type BuyerStageHistory = typeof buyerStageHistory.$inferSelect
export type NewBuyerStageHistory = typeof buyerStageHistory.$inferInsert
