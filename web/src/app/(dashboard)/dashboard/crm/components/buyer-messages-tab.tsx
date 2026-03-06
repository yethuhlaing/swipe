"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import type { BuyerWithStage } from "@/lib/data/buyers"
import type { Message } from "@/db/schema"
import { cn } from "@/lib/utils"

interface BuyerMessagesTabProps {
    messages: Message[]
    buyer: BuyerWithStage
}

export function BuyerMessagesTab({ messages, buyer }: BuyerMessagesTabProps) {
    if (messages.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground text-sm">
                        No messages in this thread yet.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                        <Link href={`/dashboard/inbox?buyer=${buyer.id}`}>
                            Open in Inbox
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>DM thread</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/inbox?buyer=${buyer.id}`}>
                        Open in Inbox
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                                msg.direction === "outbound"
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "mr-auto bg-muted"
                            )}
                        >
                            <p className="whitespace-pre-wrap break-words">
                                {msg.content}
                            </p>
                            <p
                                className={cn(
                                    "text-xs mt-1",
                                    msg.direction === "outbound"
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                )}
                            >
                                {format(new Date(msg.createdAt), "MMM d, yyyy HH:mm")}
                                {msg.direction === "outbound" ? " · You" : ""}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
