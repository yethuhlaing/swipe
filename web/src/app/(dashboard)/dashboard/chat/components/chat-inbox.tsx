"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Chat } from "./chat"
import { markConversationReadAction } from "@/actions/inbox"
import type { Conversation, Message, User } from "../use-chat"
import type { PendingDraft } from "./draft-review-card"

interface ChatInboxProps {
    tenantId: string
    conversations: Conversation[]
    messages: Record<string, Message[]>
    users: User[]
    selectedConversationId: string | null
    pendingDraft: PendingDraft | null
}

export function ChatInbox({
    tenantId,
    conversations,
    messages,
    users,
    selectedConversationId,
    pendingDraft,
}: ChatInboxProps) {
    const router = useRouter()

    useEffect(() => {
        if (selectedConversationId && tenantId) {
            const conv = conversations.find((c) => c.id === selectedConversationId)
            if (conv?.unreadCount && conv.unreadCount > 0) {
                markConversationReadAction(tenantId, selectedConversationId).catch(
                    () => {}
                )
            }
        }
    }, [tenantId, selectedConversationId, conversations])

    return (
        <div className="px-4 md:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground">
                    Review AI-drafted replies and manage DM conversations.
                </p>
            </div>
            <Chat
                conversations={conversations}
                messages={messages}
                users={users}
                selectedConversationId={selectedConversationId}
                useInboxNavigation
                tenantId={tenantId}
                pendingDraft={pendingDraft}
                onDraftResolved={() => router.refresh()}
            />
        </div>
    )
}
