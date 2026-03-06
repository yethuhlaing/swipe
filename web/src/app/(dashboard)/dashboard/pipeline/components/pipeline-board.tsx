"use client"

import { useRouter } from "next/navigation"
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import { PipelineColumn } from "./pipeline-column"
import { moveBuyerToStageAction } from "@/actions/buyer"
import { toast } from "sonner"
import type { BuyerWithStage } from "@/lib/data/buyers"
import type { PipelineStage } from "@/db/schema"

interface PipelineBoardProps {
    stages: PipelineStage[]
    buyersByStageId: Record<string, BuyerWithStage[]>
    unassignedBuyers: BuyerWithStage[]
    tenantId: string
}

export function PipelineBoard({
    stages,
    buyersByStageId,
    unassignedBuyers,
    tenantId,
}: PipelineBoardProps) {
    const router = useRouter()

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return

        const buyerId = active.id as string
        const overId = over.id as string

        const targetStage = stages.find((s) => s.id === overId)
        if (!targetStage) return

        const result = await moveBuyerToStageAction(tenantId, buyerId, overId)
        if (result.success) {
            router.refresh()
            toast.success("Buyer moved to " + targetStage.name)
        } else {
            toast.error(result.error ?? "Failed to move buyer")
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-4 no-scrollbar">
                {stages.map((stage) => (
                    <PipelineColumn
                        key={stage.id}
                        stage={stage}
                        buyers={
                            stage.position === 1 && unassignedBuyers.length > 0
                                ? [...unassignedBuyers, ...(buyersByStageId[stage.id] ?? [])]
                                : buyersByStageId[stage.id] ?? []
                        }
                    />
                ))}
            </div>
        </DndContext>
    )
}
