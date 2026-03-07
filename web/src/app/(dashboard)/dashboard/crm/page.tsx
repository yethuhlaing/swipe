import { redirect } from "next/navigation"
import { getCurrentTenant } from "@/lib/session"
import { listPipelineStages } from "@/data/pipeline"
import { listBuyers } from "@/data/buyers"
import { BuyerTable } from "./components/buyer-table"
import type { BuyerWithStage } from "@/dto/buyer"
import type { PipelineStage } from "@/db/schema"

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

interface CRMPageProps {
    searchParams: Promise<{ search?: string; stage?: string; tags?: string; page?: string; limit?: string }>
}

export default async function CRMPage({ searchParams }: CRMPageProps) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        redirect("/dashboard")
    }

    const params = await searchParams
    const search = params.search?.trim() || undefined
    const stageId = params.stage || undefined
    const tagsParam = params.tags
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : undefined
    const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
    const limit = Math.min(
        MAX_PAGE_SIZE,
        Math.max(10, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    )
    const offset = (page - 1) * limit

    const [stages, { buyers, total }] = await Promise.all([
        listPipelineStages(tenant.id),
        listBuyers({
            tenantId: tenant.id,
            search,
            stageId,
            tags,
            limit,
            offset,
            orderBy: "lastActivity",
            orderDir: "desc",
        }),
    ])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Buyers</h1>
                <p className="text-muted-foreground">
                    Search and manage your wholesale buyers. Filter by stage or tags, export to CSV.
                </p>
            </div>
            <div className="min-h-0 flex-1">
                <BuyerTable
                    buyers={buyers}
                    stages={stages as PipelineStage[]}
                    total={total}
                    page={page}
                    pageSize={limit}
                    totalPages={totalPages}
                    search={search}
                    stageId={stageId}
                    selectedTags={tags}
                />
            </div>
        </div>
    )
}
