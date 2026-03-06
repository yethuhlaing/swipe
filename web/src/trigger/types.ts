/**
 * Trigger.dev Task Payload Types
 *
 * Type definitions for all background task payloads.
 */

export type TaskPayloads = {
    "inbox.process": InboxProcessPayload
    "ai.draft": AiDraftPayload
    "ai.classify-intent": ClassifyIntentPayload
    "shopify.sync-products": ShopifySyncPayload
    "shopify.process-webhook": ShopifyWebhookPayload
    "reorder.check": ReorderCheckPayload
    "reorder.send": ReorderSendPayload
    "analytics.track": AnalyticsTrackPayload
}

export type InboxProcessPayload = {
    tenantId: string
    platform: "instagram" | "whatsapp"
    externalThreadId: string
    senderId: string
    senderUsername?: string
    senderName?: string
    messageId: string
    messageText: string
    messageTimestamp: string
    messageType?: "text" | "image" | "story_reply"
}

export type AiDraftPayload = {
    tenantId: string
    conversationId: string
    buyerId: string
    triggerMessageId: string
    messageContent: string
    buyerContext: {
        name?: string
        storeName?: string
        storeType?: string
        currentStage?: string
        previousMessages?: Array<{ role: "buyer" | "brand"; content: string }>
    }
}

export type ClassifyIntentPayload = {
    tenantId: string
    messageContent: string
    conversationContext?: {
        previousMessages?: Array<{ role: "buyer" | "brand"; content: string }>
        currentStage?: string
    }
}

export type ShopifySyncPayload = {
    tenantId: string
    shopifyShop: string
    fullSync?: boolean
}

export type ShopifyWebhookPayload = {
    tenantId: string
    topic: string
    shopifyShop: string
    payload: Record<string, unknown>
}

export type ReorderCheckPayload = {
    tenantId: string
    buyerId: string
    orderId?: string
    reorderTimerId: string
}

export type ReorderSendPayload = {
    tenantId: string
    buyerId: string
    touchNumber: number
    reorderTimerId: string
}

export type AnalyticsTrackPayload = {
    tenantId: string
    eventType: string
    eventName: string
    data?: Record<string, unknown>
    buyerId?: string
    conversationId?: string
    orderId?: string
}
