"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ConversationItem } from "./conversation-item"
import type { ConversationWithBuyer, DraftWithMeta } from "./inbox-types"

interface ConversationListProps {
    conversations: ConversationWithBuyer[]
    drafts: DraftWithMeta[]
    selectedConversationId: string | null
    onSelect: (conversationId: string) => void
}

export function ConversationList({
    conversations,
    drafts,
    selectedConversationId,
    onSelect,
}: ConversationListProps) {
    const draftCountByConversation = drafts.reduce<Record<string, number>>(
        (acc, d) => {
            acc[d.conversationId] = (acc[d.conversationId] ?? 0) + 1
            return acc
        },
        {}
    )

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b shrink-0">
                <h2 className="text-sm font-semibold text-foreground">
                    Conversations
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {conversations.length} thread
                    {conversations.length !== 1 ? "s" : ""}
                    {drafts.length > 0 && ` · ${drafts.length} pending draft${drafts.length !== 1 ? "s" : ""}`}
                </p>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {conversations.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={conv.id === selectedConversationId}
                                pendingDraftCount={
                                    draftCountByConversation[conv.id] ?? 0
                                }
                                onSelect={() => onSelect(conv.id)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
