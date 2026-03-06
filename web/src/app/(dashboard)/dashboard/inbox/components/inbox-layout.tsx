"use client"

import { useRouter } from "next/navigation"
import { ConversationList } from "./conversation-list"
import { ThreadView } from "./thread-view"
import type { ConversationWithBuyer, DraftWithMeta, Message } from "./inbox-types"

interface InboxLayoutProps {
    tenantId: string
    conversations: ConversationWithBuyer[]
    drafts: DraftWithMeta[]
    selectedConversation: ConversationWithBuyer | null
    messages: Message[]
    pendingDraft: DraftWithMeta | null
}

export function InboxLayout({
    tenantId,
    conversations,
    drafts,
    selectedConversation,
    messages,
    pendingDraft,
}: InboxLayoutProps) {
    const router = useRouter()

    function onSelectConversation(convId: string) {
        router.push(`/dashboard/inbox?conversation=${convId}`)
    }

    function onDraftResolved() {
        router.refresh()
    }

    return (
        <div className="flex min-h-0 flex-1 border rounded-lg overflow-hidden bg-card">
            <aside className="w-80 sm:w-96 border-r flex flex-col shrink-0 bg-muted/30">
                <ConversationList
                    conversations={conversations}
                    drafts={drafts}
                    selectedConversationId={selectedConversation?.id ?? null}
                    onSelect={onSelectConversation}
                />
            </aside>
            <main className="flex-1 min-w-0 flex flex-col">
                {selectedConversation ? (
                    <ThreadView
                        tenantId={tenantId}
                        conversation={selectedConversation}
                        messages={messages}
                        pendingDraft={pendingDraft}
                        onUpdate={onDraftResolved}
                    />
                ) : (
                    <EmptyThreadState />
                )}
            </main>
        </div>
    )
}

function EmptyThreadState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="rounded-full bg-muted p-4 mb-4">
                <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </div>
            <p className="font-medium text-foreground/80">Select a conversation</p>
            <p className="text-sm mt-1 max-w-xs">
                Choose a thread from the list to view messages and review AI drafts.
            </p>
        </div>
    )
}
