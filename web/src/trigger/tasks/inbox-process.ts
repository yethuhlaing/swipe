import { task } from "@trigger.dev/sdk/v3"
import { db } from "@/db"
import {
    buyers,
    conversations,
    messages,
    pipelineStages,
    buyerStageHistory,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { InboxProcessPayload } from "../client"
import { triggerTask } from "../client"

/**
 * Inbox Process Task
 *
 * Processes incoming DMs from Meta webhook:
 * 1. Find or create buyer record
 * 2. Find or create conversation
 * 3. Create message record
 * 4. Trigger AI classification and drafting
 */
export const inboxProcess = task({
    id: "inbox.process",
    retry: {
        maxAttempts: 3,
        minTimeoutInMs: 1000,
        maxTimeoutInMs: 10000,
    },
    run: async (payload: InboxProcessPayload) => {
        const {
            tenantId,
            platform,
            externalThreadId,
            senderId,
            senderUsername,
            senderName,
            messageId,
            messageText,
            messageTimestamp,
        } = payload

        // 1. Find or create buyer
        let buyer = await findBuyerByInstagramId(tenantId, senderId)

        if (!buyer) {
            buyer = await createBuyer({
                tenantId,
                instagramId: senderId,
                instagramUsername: senderUsername,
                instagramName: senderName,
            })
        }

        // 2. Find or create conversation
        let conversation = await findConversation(tenantId, buyer.id, platform)

        if (!conversation) {
            conversation = await createConversation({
                tenantId,
                buyerId: buyer.id,
                platform,
                externalThreadId,
            })
        }

        // 3. Create message record
        const message = await createMessage({
            tenantId,
            conversationId: conversation.id,
            buyerId: buyer.id,
            direction: "inbound",
            content: messageText,
            externalMessageId: messageId,
            externalTimestamp: new Date(messageTimestamp),
        })

        // 4. Update conversation with last message info
        await updateConversationLastMessage(conversation.id, {
            lastMessageAt: new Date(),
            lastMessagePreview: messageText.slice(0, 100),
            lastMessageDirection: "inbound",
            hasUnread: true,
        })

        // 5. Update buyer last activity
        await updateBuyerLastActivity(buyer.id)

        // 6. Trigger AI classification and drafting
        await triggerTask("ai.draft", {
            tenantId,
            conversationId: conversation.id,
            buyerId: buyer.id,
            triggerMessageId: message.id,
            messageContent: messageText,
            buyerContext: {
                name: buyer.instagramName ?? undefined,
                storeName: buyer.storeName ?? undefined,
                storeType: buyer.storeType ?? undefined,
                currentStage: buyer.currentStageId ?? undefined,
            },
        })

        // 7. Track analytics event
        await triggerTask("analytics.track", {
            tenantId,
            eventType: "conversation.message_received",
            eventName: "Message Received",
            buyerId: buyer.id,
            conversationId: conversation.id,
            data: {
                platform,
                messageLength: messageText.length,
            },
        })

        return {
            success: true,
            buyerId: buyer.id,
            conversationId: conversation.id,
            messageId: message.id,
        }
    },
})

// Helper functions

async function findBuyerByInstagramId(tenantId: string, instagramId: string) {
    const [buyer] = await db
        .select()
        .from(buyers)
        .where(and(eq(buyers.tenantId, tenantId), eq(buyers.instagramId, instagramId)))
        .limit(1)

    return buyer ?? null
}

async function createBuyer(data: {
    tenantId: string
    instagramId: string
    instagramUsername?: string
    instagramName?: string
}) {
    // Get the first pipeline stage for new buyers
    const [firstStage] = await db
        .select()
        .from(pipelineStages)
        .where(and(eq(pipelineStages.tenantId, data.tenantId), eq(pipelineStages.position, 1)))
        .limit(1)

    const [buyer] = await db
        .insert(buyers)
        .values({
            tenantId: data.tenantId,
            instagramId: data.instagramId,
            instagramUsername: data.instagramUsername,
            instagramName: data.instagramName,
            currentStageId: firstStage?.id,
            stageEnteredAt: new Date(),
            firstContactAt: new Date(),
            lastActivityAt: new Date(),
        })
        .returning()

    // Create stage history entry
    if (firstStage && buyer) {
        await db.insert(buyerStageHistory).values({
            tenantId: data.tenantId,
            buyerId: buyer.id,
            stageId: firstStage.id,
            enteredAt: new Date(),
        })
    }

    return buyer
}

async function findConversation(
    tenantId: string,
    buyerId: string,
    platform: "instagram" | "whatsapp"
) {
    const [conversation] = await db
        .select()
        .from(conversations)
        .where(
            and(
                eq(conversations.tenantId, tenantId),
                eq(conversations.buyerId, buyerId),
                eq(conversations.platform, platform)
            )
        )
        .limit(1)

    return conversation ?? null
}

async function createConversation(data: {
    tenantId: string
    buyerId: string
    platform: "instagram" | "whatsapp"
    externalThreadId?: string
}) {
    const [conversation] = await db
        .insert(conversations)
        .values({
            tenantId: data.tenantId,
            buyerId: data.buyerId,
            platform: data.platform,
            externalThreadId: data.externalThreadId,
            lastMessageAt: new Date(),
        })
        .returning()

    return conversation
}

async function createMessage(data: {
    tenantId: string
    conversationId: string
    buyerId: string
    direction: "inbound" | "outbound"
    content: string
    externalMessageId?: string
    externalTimestamp?: Date
}) {
    const [message] = await db
        .insert(messages)
        .values({
            tenantId: data.tenantId,
            conversationId: data.conversationId,
            buyerId: data.buyerId,
            direction: data.direction,
            content: data.content,
            externalMessageId: data.externalMessageId,
            externalTimestamp: data.externalTimestamp,
            status: "delivered",
        })
        .returning()

    return message
}

async function updateConversationLastMessage(
    conversationId: string,
    data: {
        lastMessageAt: Date
        lastMessagePreview: string
        lastMessageDirection: "inbound" | "outbound"
        hasUnread: boolean
    }
) {
    await db
        .update(conversations)
        .set({
            lastMessageAt: data.lastMessageAt,
            lastMessagePreview: data.lastMessagePreview,
            lastMessageDirection: data.lastMessageDirection,
            hasUnread: data.hasUnread,
            updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
}

async function updateBuyerLastActivity(buyerId: string) {
    await db
        .update(buyers)
        .set({
            lastActivityAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(buyers.id, buyerId))
}
