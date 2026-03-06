import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core"

/**
 * Analytics Events - Event stream for dashboard
 * Used for pipeline funnel, GMV, conversion metrics
 */
export const analyticsEvents = pgTable("analytics_events", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Event info
    eventType: text("event_type").$type<AnalyticsEventType>().notNull(),
    eventName: text("event_name").notNull(),

    // Entity references
    buyerId: text("buyer_id"),
    conversationId: text("conversation_id"),
    orderId: text("order_id"),
    draftOrderId: text("draft_order_id"),
    messageId: text("message_id"),

    // Event data
    data: jsonb("data").$type<Record<string, unknown>>().default({}),

    // Timestamp
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
    index("analytics_events_tenant_idx").on(table.tenantId),
    index("analytics_events_type_idx").on(table.eventType),
    index("analytics_events_occurred_at_idx").on(table.occurredAt),
    index("analytics_events_buyer_idx").on(table.buyerId),
])

export type AnalyticsEventType =
    | "buyer.created"
    | "buyer.stage_changed"
    | "buyer.qualified"
    | "buyer.disqualified"
    | "conversation.started"
    | "conversation.message_received"
    | "conversation.message_sent"
    | "draft_order.created"
    | "draft_order.sent"
    | "draft_order.completed"
    | "order.created"
    | "order.paid"
    | "order.shipped"
    | "order.delivered"
    | "reorder.triggered"
    | "reorder.completed"
    | "ai_draft.created"
    | "ai_draft.approved"
    | "ai_draft.rejected"
    | "ai_draft.edited"

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert

/**
 * Reorder Timers - Scheduled reorder jobs
 */
export const reorderTimers = pgTable("reorder_timers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    buyerId: text("buyer_id").notNull(),
    orderId: text("order_id"),

    // Timing
    scheduledFor: timestamp("scheduled_for").notNull(),
    reorderDays: text("reorder_days").notNull(),

    // Status
    status: text("status").$type<"scheduled" | "triggered" | "completed" | "cancelled" | "paused">().default("scheduled"),
    triggeredAt: timestamp("triggered_at"),
    completedAt: timestamp("completed_at"),

    // Result
    resultOrderId: text("result_order_id"),
    touchCount: text("touch_count").default("0"),

    // Trigger.dev job reference
    triggerJobId: text("trigger_job_id"),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("reorder_timers_tenant_idx").on(table.tenantId),
    index("reorder_timers_buyer_idx").on(table.buyerId),
    index("reorder_timers_scheduled_idx").on(table.scheduledFor),
    index("reorder_timers_status_idx").on(table.status),
])

export type ReorderTimer = typeof reorderTimers.$inferSelect
export type NewReorderTimer = typeof reorderTimers.$inferInsert
