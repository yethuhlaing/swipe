"use client"

import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { ConversationWithBuyer } from "./inbox-types"

interface ConversationItemProps {
    conversation: ConversationWithBuyer
    isSelected: boolean
    pendingDraftCount: number
    onSelect: () => void
}

function ConversationItemComponent({
    conversation,
    isSelected,
    pendingDraftCount,
    onSelect,
}: ConversationItemProps) {
    const displayName =
        conversation.buyer.storeName ||
        conversation.buyer.instagramUsername ||
        conversation.buyer.instagramName ||
        "Unknown"
    const handle = conversation.buyer.instagramUsername
        ? `@${conversation.buyer.instagramUsername}`
        : null
    const preview = conversation.lastMessagePreview
        ? conversation.lastMessagePreview.slice(0, 60)
        : "No messages yet"
    const hasUnread = conversation.hasUnread

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors border border-transparent",
                "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "bg-muted border-border"
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src={conversation.buyer.instagramProfilePic ?? undefined}
                        alt={displayName}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {hasUnread && (
                    <span
                        className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background"
                        aria-label="Unread"
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <span
                        className={cn(
                            "font-medium truncate",
                            hasUnread && "text-foreground"
                        )}
                    >
                        {handle || displayName}
                    </span>
                    {pendingDraftCount > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium px-1.5 py-0.5">
                            Draft
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {preview}
                </p>
            </div>
        </button>
    )
}

export const ConversationItem = memo(ConversationItemComponent)
