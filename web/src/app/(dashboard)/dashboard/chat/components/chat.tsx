"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ConversationList } from "./conversation-list"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { DraftReviewCard } from "./draft-review-card"
import {
    useChat,
    type Conversation,
    type Message,
    type User,
} from "../use-chat"
import type { PendingDraft } from "./draft-review-card"

interface ChatProps {
    conversations: Conversation[]
    messages: Record<string, Message[]>
    users: User[]
    /** Inbox mode: selected conversation from URL (server-driven) */
    selectedConversationId?: string | null
    /** Inbox mode: when set, clicking a conversation navigates to /dashboard/chat?conversation=id */
    useInboxNavigation?: boolean
    /** Inbox mode: tenant id for draft actions */
    tenantId?: string
    /** Inbox mode: pending AI draft for the selected conversation */
    pendingDraft?: PendingDraft | null
    /** Inbox mode: called after approve/reject draft (e.g. router.refresh) */
    onDraftResolved?: () => void
}

export function Chat({
    conversations,
    messages,
    users,
    selectedConversationId = null,
    useInboxNavigation = false,
    tenantId,
    pendingDraft,
    onDraftResolved,
}: ChatProps) {
    const router = useRouter()
    const {
        selectedConversation,
        setSelectedConversation,
        setConversations,
        setMessages,
        setUsers,
        addMessage,
        toggleMute,
    } = useChat()

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== "undefined" ? window.innerWidth : 0 >= 1024) {
                // lg breakpoint
                setIsSidebarOpen(false)
            }
        }

        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize)
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", handleResize)
            }
        }
    }, [])

    // Initialize data (and sync when props change, e.g. inbox URL change)
    useEffect(() => {
        setConversations(conversations)
        setUsers(users)
        Object.entries(messages).forEach(
            ([conversationId, conversationMessages]) => {
                setMessages(conversationId, conversationMessages)
            }
        )
        if (useInboxNavigation && selectedConversationId !== undefined) {
            setSelectedConversation(selectedConversationId)
        } else if (
            !useInboxNavigation &&
            !selectedConversation &&
            conversations.length > 0
        ) {
            setSelectedConversation(conversations[0].id)
        }
    }, [
        conversations,
        messages,
        users,
        useInboxNavigation,
        selectedConversationId,
        setConversations,
        setMessages,
        setUsers,
        setSelectedConversation,
    ])

    const effectiveSelected = useInboxNavigation
        ? selectedConversationId
        : selectedConversation
    const currentConversation = conversations.find(
        (conv) => conv.id === effectiveSelected
    )
    const currentMessages = effectiveSelected
        ? messages[effectiveSelected] || []
        : []

    const handleSelectConversation = (id: string) => {
        if (useInboxNavigation) {
            router.push(`/dashboard/chat?conversation=${id}`)
        } else {
            setSelectedConversation(id)
        }
        setIsSidebarOpen(false)
    }

    const handleSendMessage = (content: string) => {
        if (!selectedConversation) return

        const newMessage = {
            id: `msg-${Date.now()}`,
            content,
            timestamp: new Date().toISOString(),
            senderId: "current-user",
            type: "text" as const,
            isEdited: false,
            reactions: [],
            replyTo: null,
        }

        addMessage(selectedConversation, newMessage)
    }

    const handleToggleMute = () => {
        if (selectedConversation) {
            toggleMute(selectedConversation)
        }
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="h-full min-h-[600px] max-h-[calc(100vh-200px)] flex rounded-lg border overflow-hidden bg-background">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Conversations Sidebar - Responsive */}
                <div
                    className={`
          w-100 border-r bg-background flex-shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:block
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
        `}
                >
                    {/* Sidebar Header with Close Button (Mobile Only) */}
                    <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarOpen(false)}
                            className="cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <ConversationList
                        conversations={conversations}
                        selectedConversation={effectiveSelected}
                        onSelectConversation={handleSelectConversation}
                    />
                </div>

                {/* Chat Panel - Flexible Width */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    {/* Chat Header with Hamburger Menu */}
                    <div className="flex items-center h-16 px-4 border-b bg-background">
                        {/* Hamburger Menu Button - Only visible when sidebar is hidden on mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarOpen(true)}
                            className="cursor-pointer lg:hidden mr-2"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        <div className="flex-1">
                            <ChatHeader
                                conversation={currentConversation || null}
                                users={users}
                                onToggleMute={handleToggleMute}
                                buyerId={currentConversation?.buyerId}
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {effectiveSelected ? (
                            <>
                                <MessageList
                                    messages={currentMessages}
                                    users={users}
                                />

                                {/* Inbox: AI draft review */}
                                {tenantId && pendingDraft && onDraftResolved && (
                                    <div className="border-t px-4 py-3 bg-muted/20">
                                        <DraftReviewCard
                                            draft={pendingDraft}
                                            tenantId={tenantId}
                                            onResolved={onDraftResolved}
                                        />
                                    </div>
                                )}

                                {/* Message Input */}
                                <MessageInput
                                    onSendMessage={handleSendMessage}
                                    placeholder={`Message ${currentConversation?.name || ""}...`}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold mb-2">
                                        Welcome to Chat
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Select a conversation to start messaging
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
