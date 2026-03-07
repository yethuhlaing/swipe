"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { BuyerCard } from "./buyer-card"
import type { BuyerWithStage } from "@/lib/dto"
import type { PipelineStage } from "@/db/schema"

interface PipelineColumnProps {
    stage: PipelineStage
    buyers: BuyerWithStage[]
    isOver?: boolean
}

export function PipelineColumn({
    stage,
    buyers,
    isOver,
}: PipelineColumnProps) {
    const { setNodeRef, isOver: isOverDroppable } = useDroppable({
        id: stage.id,
        data: { type: "stage", stage },
    })

    const active = isOver ?? isOverDroppable
    const stageColor = stage.color ?? "#6366f1"

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex min-w-0 flex-1 flex-col rounded-lg border bg-muted/30 transition-colors",
                active && "ring-2 ring-primary/30 bg-muted/50"
            )}
        >
            <div
                className="flex shrink-0 items-center gap-2 rounded-t-lg border-b px-4 py-3"
                style={{
                    borderLeftColor: stageColor,
                    borderLeftWidth: "4px",
                }}
            >
                <h3 className="truncate font-semibold text-foreground">{stage.name}</h3>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {buyers.length}
                </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 no-scrollbar">
                {buyers.map((buyer) => (
                    <BuyerCard key={buyer.id} buyer={buyer} />
                ))}
            </div>
        </div>
    )
}
