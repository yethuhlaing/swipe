"use client"

import { memo } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Message } from "./inbox-types"

interface MessageBubbleProps {
    message: Message
}

function MessageBubbleComponent({ message }: MessageBubbleProps) {
    const isOutbound = message.direction === "outbound"

    return (
        <div
            className={cn(
                "flex w-full",
                isOutbound ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-sm",
                    isOutbound
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                )}
            >
                <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                <p
                    className={cn(
                        "text-xs mt-1.5",
                        isOutbound
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                    )}
                >
                    {format(new Date(message.createdAt), "MMM d, h:mm a")}
                    {isOutbound && " · You"}
                </p>
            </div>
        </div>
    )
}

export const MessageBubble = memo(MessageBubbleComponent)
