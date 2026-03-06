import { pgTable, text, timestamp, integer, jsonb, boolean, numeric, index } from "drizzle-orm/pg-core"

/**
 * Orders - Shopify order records (completed orders)
 */
export const orders = pgTable("orders", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    buyerId: text("buyer_id").notNull(),

    // Shopify info
    shopifyOrderId: text("shopify_order_id"),
    shopifyOrderNumber: text("shopify_order_number"),
    shopifyOrderUrl: text("shopify_order_url"),

    // Order details
    status: text("status").$type<"pending" | "paid" | "fulfilled" | "cancelled" | "refunded">().default("pending"),
    paymentStatus: text("payment_status").$type<"pending" | "paid" | "partial" | "refunded">().default("pending"),
    fulfillmentStatus: text("fulfillment_status").$type<"unfulfilled" | "partial" | "fulfilled" | "shipped" | "delivered">().default("unfulfilled"),

    // Amounts
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }),
    discount: numeric("discount", { precision: 10, scale: 2 }),
    shipping: numeric("shipping", { precision: 10, scale: 2 }),
    tax: numeric("tax", { precision: 10, scale: 2 }),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),

    // Line items (denormalized for quick access)
    lineItems: jsonb("line_items").$type<OrderLineItem[]>().default([]),
    itemCount: integer("item_count").default(0),

    // Net terms (Growth tier)
    paymentTerms: text("payment_terms").$type<"immediate" | "net15" | "net30" | "net60">().default("immediate"),
    dueAt: timestamp("due_at"),
    paidAt: timestamp("paid_at"),
    isOverdue: boolean("is_overdue").default(false),

    // Fulfillment
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),

    // DM notifications sent
    invoiceSentAt: timestamp("invoice_sent_at"),
    thankYouSentAt: timestamp("thank_you_sent_at"),
    shippedNotificationSentAt: timestamp("shipped_notification_sent_at"),
    deliveredNotificationSentAt: timestamp("delivered_notification_sent_at"),

    // Reorder tracking
    isReorder: boolean("is_reorder").default(false),
    previousOrderId: text("previous_order_id"),

    // Metadata
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("orders_tenant_idx").on(table.tenantId),
    index("orders_buyer_idx").on(table.buyerId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
])

export type OrderLineItem = {
    productId: string
    variantId?: string
    title: string
    variantTitle?: string
    quantity: number
    price: string
    sku?: string
    imageUrl?: string
}

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

/**
 * Draft Orders - Pending invoices (not yet paid)
 */
export const draftOrders = pgTable("draft_orders", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    buyerId: text("buyer_id").notNull(),
    conversationId: text("conversation_id"),

    // Shopify info
    shopifyDraftOrderId: text("shopify_draft_order_id"),
    shopifyInvoiceUrl: text("shopify_invoice_url"),

    // Status
    status: text("status").$type<"draft" | "sent" | "completed" | "cancelled" | "expired">().default("draft"),

    // Amounts
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }),
    discount: numeric("discount", { precision: 10, scale: 2 }),
    shipping: numeric("shipping", { precision: 10, scale: 2 }),
    tax: numeric("tax", { precision: 10, scale: 2 }),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),

    // Line items
    lineItems: jsonb("line_items").$type<OrderLineItem[]>().default([]),
    itemCount: integer("item_count").default(0),

    // Price tier applied
    appliedPriceTier: text("applied_price_tier").$type<"tier1" | "tier2" | "tier3">(),

    // Payment terms
    paymentTerms: text("payment_terms").$type<"immediate" | "net15" | "net30" | "net60">().default("immediate"),

    // DM info
    invoiceSentAt: timestamp("invoice_sent_at"),
    invoiceMessageId: text("invoice_message_id"),

    // When completed, link to the order
    completedOrderId: text("completed_order_id"),

    // Metadata
    notes: text("notes"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("draft_orders_tenant_idx").on(table.tenantId),
    index("draft_orders_buyer_idx").on(table.buyerId),
    index("draft_orders_status_idx").on(table.status),
])

export type DraftOrder = typeof draftOrders.$inferSelect
export type NewDraftOrder = typeof draftOrders.$inferInsert
