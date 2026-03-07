import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { listPipelineStages } from "@/lib/data/pipeline"
import { listBuyers } from "@/lib/data/buyers"
import { PipelineBoard } from "./components/pipeline-board"
import type { BuyerWithStage } from "@/lib/dto"
import type { PipelineStage } from "@/db/schema"

export default async function PipelinePage() {
    const tenant = await getCurrentTenant()
    console.log("tenant", tenant)
    if (!tenant) {
        redirect("/dashboard")
    }

    const [stages, { buyers }] = await Promise.all([
        listPipelineStages(tenant.id),
        listBuyers({
            tenantId: tenant.id,
            limit: 500,
            orderBy: "lastActivity",
            orderDir: "desc",
        }),
    ])

    const buyersByStageId = stages.reduce(
        (acc, stage) => {
            acc[stage.id] = buyers.filter(
                (b) => b.currentStageId === stage.id
            ) as BuyerWithStage[]
            return acc
        },
        {} as Record<string, BuyerWithStage[]>
    )

    const unassignedBuyers = buyers.filter(
        (b) => !b.currentStageId || !stages.some((s) => s.id === b.currentStageId)
    ) as BuyerWithStage[]

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                <p className="text-muted-foreground">
                    Manage buyer relationships across your wholesale funnel. Drag
                    cards between stages to update.
                </p>
            </div>
            <div className="min-h-0 flex-1">
                <PipelineBoard
                    stages={stages as PipelineStage[]}
                    buyersByStageId={buyersByStageId}
                    unassignedBuyers={unassignedBuyers}
                    tenantId={tenant.id}
                />
            </div>
        </div>
    )
}
