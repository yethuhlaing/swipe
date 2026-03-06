"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { DraftReviewCard } from "./draft-review-card"
import { markConversationReadAction } from "@/actions/inbox"
import type { ConversationWithBuyer, DraftWithMeta, Message } from "./inbox-types"

interface ThreadViewProps {
    tenantId: string
    conversation: ConversationWithBuyer
    messages: Message[]
    pendingDraft: DraftWithMeta | null
    onUpdate: () => void
}

export function ThreadView({
    tenantId,
    conversation,
    messages,
    pendingDraft,
    onUpdate,
}: ThreadViewProps) {
    useEffect(() => {
        if (!conversation.hasUnread) return
        markConversationReadAction(tenantId, conversation.id).catch(() => {})
    }, [tenantId, conversation.id, conversation.hasUnread])

    const displayName =
        conversation.buyer.storeName ||
        conversation.buyer.instagramUsername ||
        conversation.buyer.instagramName ||
        "Unknown"
    const handle = conversation.buyer.instagramUsername
        ? `@${conversation.buyer.instagramUsername}`
        : null

    return (
        <div className="flex flex-col h-full">
            <header className="shrink-0 border-b px-4 py-3 flex items-center gap-3 bg-muted/30">
                <Avatar className="h-9 w-9">
                    <AvatarImage
                        src={conversation.buyer.instagramProfilePic ?? undefined}
                        alt={displayName}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                        {handle || displayName}
                    </p>
                    {conversation.buyer.storeName && handle && (
                        <p className="text-xs text-muted-foreground truncate">
                            {conversation.buyer.storeName}
                        </p>
                    )}
                </div>
                <Link
                    href={`/dashboard/crm/${conversation.buyer.id}`}
                    className="text-sm text-primary hover:underline"
                >
                    View profile
                </Link>
            </header>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && !pendingDraft && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No messages in this thread yet.
                        </p>
                    )}
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    {pendingDraft && (
                        <div className="pt-2">
                            <DraftReviewCard
                                draft={pendingDraft}
                                tenantId={tenantId}
                                onResolved={onUpdate}
                            />
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
