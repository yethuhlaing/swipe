/**
 * Shared types for inbox UI (aligned with action return shapes).
 */

import type { Conversation, Message, AiDraft } from "@/db/schema"

export interface InboxBuyer {
    id: string
    instagramUsername: string | null
    instagramName: string | null
    storeName: string | null
    instagramProfilePic: string | null
}

export type ConversationWithBuyer = Conversation & { buyer: InboxBuyer }

export type MessageWithDirection = Message

export interface DraftConversationMeta {
    id: string
    lastMessagePreview: string | null
}

export type DraftWithMeta = AiDraft & {
    buyer: InboxBuyer
    conversation: DraftConversationMeta
}

// Re-export for convenience
export type { Message }
