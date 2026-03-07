"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { aiDrafts, messages, conversations, buyers } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getTenantById } from "@/data/tenants"
import { moveBuyerToStage } from "@/services/buyer.service"
import { triggerTask } from "@/trigger/client"

/**
 * Inbox Server Actions
 *
 * Operations for managing DM conversations and AI drafts.
 */

// ============================================================================
// Helpers
// ============================================================================

async function verifyTenantAccess(tenantId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return { authorized: false, error: "Unauthorized" }
    }

    const tenant = await getTenantById(tenantId)
    if (!tenant || tenant.ownerId !== session.user.id) {
        return { authorized: false, error: "Not found" }
    }

    return { authorized: true, userId: session.user.id, tenant }
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Get recent conversations (for inbox sidebar, with unread indicator)
 */
export async function getRecentConversationsAction(tenantId: string, limit = 50) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, conversations: [] }
    }

    try {
        const results = await db
            .select({
                conversation: conversations,
                buyer: {
                    id: buyers.id,
                    instagramUsername: buyers.instagramUsername,
                    instagramName: buyers.instagramName,
                    storeName: buyers.storeName,
                    instagramProfilePic: buyers.instagramProfilePic,
                },
            })
            .from(conversations)
            .innerJoin(buyers, eq(buyers.id, conversations.buyerId))
            .where(eq(conversations.tenantId, tenantId))
            .orderBy(desc(conversations.lastMessageAt))
            .limit(limit)

        return {
            success: true,
            conversations: results.map((r) => ({
                ...r.conversation,
                buyer: r.buyer,
            })),
        }
    } catch (error) {
        console.error("Failed to get conversations:", error)
        return { success: false, error: "Failed to load conversations", conversations: [] }
    }
}

/**
 * Get conversations with unread messages
 */
export async function getUnreadConversationsAction(tenantId: string) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, conversations: [] }
    }

    try {
        const results = await db
            .select({
                conversation: conversations,
                buyer: {
                    id: buyers.id,
                    instagramUsername: buyers.instagramUsername,
                    instagramName: buyers.instagramName,
                    storeName: buyers.storeName,
                    instagramProfilePic: buyers.instagramProfilePic,
                },
            })
            .from(conversations)
            .innerJoin(buyers, eq(buyers.id, conversations.buyerId))
            .where(
                and(
                    eq(conversations.tenantId, tenantId),
                    eq(conversations.hasUnread, true)
                )
            )
            .orderBy(desc(conversations.lastMessageAt))
            .limit(50)

        return {
            success: true,
            conversations: results.map((r) => ({
                ...r.conversation,
                buyer: r.buyer,
            })),
        }
    } catch (error) {
        console.error("Failed to get conversations:", error)
        return { success: false, error: "Failed to load conversations", conversations: [] }
    }
}

/**
 * Get pending AI drafts for review
 */
export async function getPendingDraftsAction(tenantId: string) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, drafts: [] }
    }

    try {
        const results = await db
            .select({
                draft: aiDrafts,
                buyer: {
                    id: buyers.id,
                    instagramUsername: buyers.instagramUsername,
                    instagramName: buyers.instagramName,
                    storeName: buyers.storeName,
                    instagramProfilePic: buyers.instagramProfilePic,
                },
                conversation: {
                    id: conversations.id,
                    lastMessagePreview: conversations.lastMessagePreview,
                },
            })
            .from(aiDrafts)
            .innerJoin(buyers, eq(buyers.id, aiDrafts.buyerId))
            .innerJoin(conversations, eq(conversations.id, aiDrafts.conversationId))
            .where(
                and(eq(aiDrafts.tenantId, tenantId), eq(aiDrafts.status, "pending"))
            )
            .orderBy(desc(aiDrafts.createdAt))
            .limit(50)

        return {
            success: true,
            drafts: results.map((r) => ({
                ...r.draft,
                buyer: r.buyer,
                conversation: r.conversation,
            })),
        }
    } catch (error) {
        console.error("Failed to get drafts:", error)
        return { success: false, error: "Failed to load drafts", drafts: [] }
    }
}

/**
 * Get a single conversation with messages (for thread view)
 */
export async function getConversationWithMessagesAction(
    tenantId: string,
    conversationId: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error, conversation: null, messages: [] }
    }

    try {
        const [convRow] = await db
            .select({
                conversation: conversations,
                buyer: {
                    id: buyers.id,
                    instagramUsername: buyers.instagramUsername,
                    instagramName: buyers.instagramName,
                    storeName: buyers.storeName,
                    instagramProfilePic: buyers.instagramProfilePic,
                },
            })
            .from(conversations)
            .innerJoin(buyers, eq(buyers.id, conversations.buyerId))
            .where(
                and(
                    eq(conversations.tenantId, tenantId),
                    eq(conversations.id, conversationId)
                )
            )
            .limit(1)

        if (!convRow) {
            return { success: false, error: "Conversation not found", conversation: null, messages: [] }
        }

        const messageList = await db
            .select()
            .from(messages)
            .where(
                and(
                    eq(messages.tenantId, tenantId),
                    eq(messages.conversationId, conversationId)
                )
            )
            .orderBy(messages.createdAt)
            .limit(200)

        return {
            success: true,
            conversation: {
                ...convRow.conversation,
                buyer: convRow.buyer,
            },
            messages: messageList,
        }
    } catch (error) {
        console.error("Failed to get conversation:", error)
        return { success: false, error: "Failed to load conversation", conversation: null, messages: [] }
    }
}

/**
 * Approve an AI draft and send it
 */
export async function approveDraftAction(
    tenantId: string,
    draftId: string,
    editedContent?: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        // Get the draft
        const [draft] = await db
            .select()
            .from(aiDrafts)
            .where(and(eq(aiDrafts.tenantId, tenantId), eq(aiDrafts.id, draftId)))
            .limit(1)

        if (!draft) {
            return { success: false, error: "Draft not found" }
        }

        if (draft.status !== "pending") {
            return { success: false, error: "Draft already processed" }
        }

        const finalContent = editedContent?.trim() || draft.content
        const wasEdited = editedContent && editedContent.trim() !== draft.content

        // Update draft status
        await db
            .update(aiDrafts)
            .set({
                status: wasEdited ? "edited" : "approved",
                approvedBy: access.userId,
                approvedAt: new Date(),
                editedContent: wasEdited ? finalContent : null,
                updatedAt: new Date(),
            })
            .where(eq(aiDrafts.id, draftId))

        // Create outbound message record
        const [message] = await db
            .insert(messages)
            .values({
                tenantId,
                conversationId: draft.conversationId,
                buyerId: draft.buyerId,
                direction: "outbound",
                content: finalContent,
                contentType: "text",
                status: "pending",
                aiDraftId: draftId,
            })
            .returning()

        // Update conversation
        await db
            .update(conversations)
            .set({
                lastMessageAt: new Date(),
                lastMessagePreview: finalContent.slice(0, 100),
                lastMessageDirection: "outbound",
                hasUnread: false,
                updatedAt: new Date(),
            })
            .where(eq(conversations.id, draft.conversationId))

        // If there's a suggested stage change, apply it
        if (draft.suggestedStageId) {
            await moveBuyerToStage(tenantId, draft.buyerId, draft.suggestedStageId)
        }

        // Track analytics
        await triggerTask("analytics.track", {
            tenantId,
            eventType: wasEdited ? "ai_draft.edited" : "ai_draft.approved",
            eventName: wasEdited ? "AI Draft Edited" : "AI Draft Approved",
            buyerId: draft.buyerId,
            conversationId: draft.conversationId,
            data: {
                draftId,
                originalLength: draft.content.length,
                finalLength: finalContent.length,
            },
        })

        // TODO: Actually send the message via Meta API
        // This will be implemented when Meta API integration is complete

        revalidatePath("/dashboard/chat")

        return { success: true, messageId: message.id }
    } catch (error) {
        console.error("Failed to approve draft:", error)
        return { success: false, error: "Failed to send message" }
    }
}

/**
 * Reject an AI draft
 */
export async function rejectDraftAction(tenantId: string, draftId: string) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        const [draft] = await db
            .select()
            .from(aiDrafts)
            .where(and(eq(aiDrafts.tenantId, tenantId), eq(aiDrafts.id, draftId)))
            .limit(1)

        if (!draft) {
            return { success: false, error: "Draft not found" }
        }

        await db
            .update(aiDrafts)
            .set({
                status: "rejected",
                updatedAt: new Date(),
            })
            .where(eq(aiDrafts.id, draftId))

        // Track analytics
        await triggerTask("analytics.track", {
            tenantId,
            eventType: "ai_draft.rejected",
            eventName: "AI Draft Rejected",
            buyerId: draft.buyerId,
            conversationId: draft.conversationId,
            data: { draftId },
        })

        revalidatePath("/dashboard/chat")

        return { success: true }
    } catch (error) {
        console.error("Failed to reject draft:", error)
        return { success: false, error: "Failed to reject draft" }
    }
}

/**
 * Mark conversation as read
 */
export async function markConversationReadAction(
    tenantId: string,
    conversationId: string
) {
    const access = await verifyTenantAccess(tenantId)
    if (!access.authorized) {
        return { success: false, error: access.error }
    }

    try {
        await db
            .update(conversations)
            .set({
                hasUnread: false,
                unreadCount: "0",
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(conversations.tenantId, tenantId),
                    eq(conversations.id, conversationId)
                )
            )

        // Mark all messages as read
        await db
            .update(messages)
            .set({
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(messages.conversationId, conversationId),
                    eq(messages.isRead, false)
                )
            )

        return { success: true }
    } catch (error) {
        console.error("Failed to mark conversation read:", error)
        return { success: false, error: "Failed to update" }
    }
}
