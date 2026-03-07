import { db } from "@/db"
import { conversations, messages, type Message, type Conversation } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"

/**
 * Conversations & Messages Data Access
 *
 * Used by CRM detail (messages tab) and inbox.
 */

export async function getConversationByBuyerId(
    tenantId: string,
    buyerId: string
): Promise<Conversation | null> {
    const [conv] = await db
        .select()
        .from(conversations)
        .where(
            and(
                eq(conversations.tenantId, tenantId),
                eq(conversations.buyerId, buyerId)
            )
        )
        .orderBy(desc(conversations.lastMessageAt))
        .limit(1)

    return conv ?? null
}

export async function getMessagesByConversationId(
    tenantId: string,
    conversationId: string,
    limit = 100
): Promise<Message[]> {
    return db
        .select()
        .from(messages)
        .where(
            and(
                eq(messages.tenantId, tenantId),
                eq(messages.conversationId, conversationId)
            )
        )
        .orderBy(messages.createdAt)
        .limit(limit)
}

/** Get all messages for a buyer (uses their primary conversation) */
export async function getMessagesByBuyerId(
    tenantId: string,
    buyerId: string,
    limit = 100
): Promise<{ messages: Message[]; conversation: Conversation | null }> {
    const conversation = await getConversationByBuyerId(tenantId, buyerId)
    if (!conversation) {
        return { messages: [], conversation: null }
    }

    const messagesList = await getMessagesByConversationId(
        tenantId,
        conversation.id,
        limit
    )
    return { messages: messagesList, conversation }
}
