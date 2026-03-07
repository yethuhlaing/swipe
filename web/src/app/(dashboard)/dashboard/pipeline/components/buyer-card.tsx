"use client"

import { memo } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { formatDistanceToNow } from "date-fns"
import { GripVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuickActions } from "./quick-actions"
import type { BuyerWithStage } from "@/lib/dto"

interface BuyerCardProps {
    buyer: BuyerWithStage
}

function daysInStage(enteredAt: Date | null, createdAt: Date): number {
    const from = enteredAt ?? createdAt
    return Math.max(0, Math.floor((Date.now() - from.getTime()) / (24 * 60 * 60 * 1000)))
}

function BuyerCardInner({ buyer }: BuyerCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: buyer.id,
        data: { type: "buyer", buyer },
    })

    const style = transform
        ? {
              transform: CSS.Translate.toString(transform),
          }
        : undefined

    const rawUsername = buyer.instagramUsername ?? buyer.instagramName
    const username = rawUsername ? `@${String(rawUsername).replace(/^@/, "")}` : "—"
    const storeName = buyer.storeName ?? "—"
    const days = daysInStage(buyer.stageEnteredAt, buyer.createdAt)
    const lastActivity = buyer.lastActivityAt
        ? formatDistanceToNow(buyer.lastActivityAt, { addSuffix: true })
        : "—"

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative flex flex-col gap-2 rounded-lg border bg-card p-3 pl-6 shadow-sm
                transition-shadow hover:shadow-md
                ${isDragging ? "opacity-90 shadow-lg ring-2 ring-primary/20 z-50" : ""}
            `}
        >
            {/* Drag handle - only this area starts drag */}
            <div
                className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                {...listeners}
                {...attributes}
            >
                <GripVertical className="size-4" />
            </div>
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar className="size-8 shrink-0">
                        <AvatarImage
                            src={buyer.instagramProfilePic ?? undefined}
                            alt={username}
                        />
                        <AvatarFallback className="text-xs">
                            {(username[0] ?? "?").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                            {username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {storeName}
                        </p>
                    </div>
                </div>
                <QuickActions
                    buyerId={buyer.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span title="Days in current stage">
                    {days}d in stage
                </span>
                <span title="Last activity">
                    {lastActivity}
                </span>
            </div>
        </div>
    )
}

export const BuyerCard = memo(BuyerCardInner)
