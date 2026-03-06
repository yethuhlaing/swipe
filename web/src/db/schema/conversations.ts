import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core"

/**
 * Conversations - DM thread metadata
 */
export const conversations = pgTable("conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    buyerId: text("buyer_id").notNull(),

    // Platform info
    platform: text("platform").$type<"instagram" | "whatsapp">().default("instagram"),
    externalThreadId: text("external_thread_id"),

    // Status
    status: text("status").$type<"active" | "snoozed" | "closed">().default("active"),
    snoozedUntil: timestamp("snoozed_until"),

    // Last message info (denormalized for quick access)
    lastMessageAt: timestamp("last_message_at"),
    lastMessagePreview: text("last_message_preview"),
    lastMessageDirection: text("last_message_direction").$type<"inbound" | "outbound">(),

    // Unread tracking
    hasUnread: boolean("has_unread").default(false),
    unreadCount: text("unread_count").default("0"),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("conversations_tenant_idx").on(table.tenantId),
    index("conversations_buyer_idx").on(table.buyerId),
    index("conversations_last_message_idx").on(table.lastMessageAt),
    index("conversations_unread_idx").on(table.tenantId, table.hasUnread),
])

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

/**
 * Messages - Individual DM messages
 */
export const messages = pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    conversationId: text("conversation_id").notNull(),
    buyerId: text("buyer_id").notNull(),

    // Message content
    direction: text("direction").$type<"inbound" | "outbound">().notNull(),
    content: text("content").notNull(),
    contentType: text("content_type").$type<"text" | "image" | "product_card" | "catalog_link" | "invoice_link">().default("text"),

    // External IDs
    externalMessageId: text("external_message_id"),
    externalTimestamp: timestamp("external_timestamp"),

    // AI processing
    intent: text("intent").$type<"wholesale_inquiry" | "product_question" | "order_request" | "reorder_confirm" | "general" | "unknown">(),
    intentConfidence: text("intent_confidence"),
    extractedInfo: jsonb("extracted_info").$type<ExtractedMessageInfo>(),

    // Status
    status: text("status").$type<"pending" | "sent" | "delivered" | "read" | "failed">().default("pending"),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),

    // If this was an AI-drafted message
    aiDraftId: text("ai_draft_id"),

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_tenant_idx").on(table.tenantId),
    index("messages_created_at_idx").on(table.createdAt),
])

export type ExtractedMessageInfo = {
    name?: string
    storeName?: string
    location?: string
    productInterests?: string[]
    moqQuestion?: boolean
    priceQuestion?: boolean
}

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

/**
 * AI Drafts - Generated drafts pending approval
 */
export const aiDrafts = pgTable("ai_drafts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    conversationId: text("conversation_id").notNull(),
    buyerId: text("buyer_id").notNull(),

    // Draft content
    content: text("content").notNull(),
    suggestedStageId: text("suggested_stage_id"),

    // AI metadata
    model: text("model").default("gpt-4o"),
    promptTokens: text("prompt_tokens"),
    completionTokens: text("completion_tokens"),
    confidence: text("confidence"),

    // Status
    status: text("status").$type<"pending" | "approved" | "edited" | "rejected" | "expired">().default("pending"),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at"),
    editedContent: text("edited_content"),

    // Reference to the triggering message
    triggerMessageId: text("trigger_message_id"),

    // Metadata
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("ai_drafts_conversation_idx").on(table.conversationId),
    index("ai_drafts_status_idx").on(table.tenantId, table.status),
])

export type AiDraft = typeof aiDrafts.$inferSelect
export type NewAiDraft = typeof aiDrafts.$inferInsert
